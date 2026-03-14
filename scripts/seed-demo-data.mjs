import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const rootDir = process.cwd();
loadEnvFile(path.join(rootDir, ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO = {
  users: {
    workerA: {
      email: "demo.worker1@clipboardhealth.dev",
      password: "Demo@12345",
      role: "healthcare_worker",
    },
    workerB: {
      email: "demo.worker2@clipboardhealth.dev",
      password: "Demo@12345",
      role: "healthcare_worker",
    },
    facilityAdmin: {
      email: "demo.facility@clipboardhealth.dev",
      password: "Demo@12345",
      role: "facility_admin",
    },
    admin: {
      email: "demo.admin@clipboardhealth.dev",
      password: "Demo@12345",
      role: "admin",
    },
  },
  ids: {
    facility: "11111111-1111-4111-8111-111111111111",
    licenseA: "22222222-2222-4222-8222-222222222221",
    licenseB: "22222222-2222-4222-8222-222222222222",
    certA: "33333333-3333-4333-8333-333333333331",
    certB: "33333333-3333-4333-8333-333333333332",
    availA1: "44444444-4444-4444-8444-444444444441",
    availA2: "44444444-4444-4444-8444-444444444442",
    availB1: "44444444-4444-4444-8444-444444444443",
    shiftCompleted: "55555555-5555-4555-8555-555555555551",
    shiftOpen: "55555555-5555-4555-8555-555555555552",
    appAccepted: "66666666-6666-4666-8666-666666666661",
    appApplied: "66666666-6666-4666-8666-666666666662",
    assignmentCompleted: "77777777-7777-4777-8777-777777777771",
    conversationMain: "88888888-8888-4888-8888-888888888881",
    messageA: "99999999-9999-4999-8999-999999999991",
    messageB: "99999999-9999-4999-8999-999999999992",
    reviewFacilityToWorker: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    reviewWorkerToFacility: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
  },
};

async function listAllUsersByEmail() {
  const byEmail = new Map();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    for (const user of users) {
      if (user.email) {
        byEmail.set(user.email.toLowerCase(), user);
      }
    }

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return byEmail;
}

async function ensureUser(usersByEmail, config) {
  const key = config.email.toLowerCase();
  const existing = usersByEmail.get(key);
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: config.password,
      email_confirm: true,
      user_metadata: { role: config.role },
    });
    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: config.email,
    password: config.password,
    email_confirm: true,
    user_metadata: { role: config.role },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Unable to create user: ${config.email}`);
  }

  usersByEmail.set(key, data.user);
  return data.user;
}

async function upsert(table, rows, onConflict) {
  const options = onConflict ? { onConflict } : undefined;
  const { error } = await supabase.from(table).upsert(rows, options);
  if (error) {
    throw new Error(`${table} upsert failed: ${error.message}`);
  }
}

async function main() {
  console.log("Seeding demo dataset...");
  const usersByEmail = await listAllUsersByEmail();

  const workerA = await ensureUser(usersByEmail, DEMO.users.workerA);
  const workerB = await ensureUser(usersByEmail, DEMO.users.workerB);
  const facilityAdmin = await ensureUser(usersByEmail, DEMO.users.facilityAdmin);
  const admin = await ensureUser(usersByEmail, DEMO.users.admin);

  await upsert(
    "user_roles",
    [
      { user_id: workerA.id, role: "healthcare_worker" },
      { user_id: workerB.id, role: "healthcare_worker" },
      { user_id: facilityAdmin.id, role: "facility_admin" },
      { user_id: admin.id, role: "admin" },
    ],
    "user_id",
  );

  await upsert(
    "worker_profiles",
    [
      {
        user_id: workerA.id,
        full_name: "Aarav Patel",
        phone: "+91-9000000002",
        location: "Ahmedabad",
        specialty: "CNA",
        years_experience: 4,
        bio: "Reliable CNA for night and weekend shifts.",
        verification_status: "verified",
      },
      {
        user_id: workerB.id,
        full_name: "Riya Shah",
        phone: "+91-9000000003",
        location: "Ahmedabad",
        specialty: "RN",
        years_experience: 6,
        bio: "Registered nurse focused on med-surg care.",
        verification_status: "verified",
      },
    ],
    "user_id",
  );

  await upsert(
    "facility_profiles",
    [
      {
        user_id: facilityAdmin.id,
        contact_name: "Vivek Vaghasiya",
        phone: "+91-9000000001",
        organization_name: "Sunrise Care Group",
      },
    ],
    "user_id",
  );

  await upsert(
    "facilities",
    [
      {
        id: DEMO.ids.facility,
        name: "Sunrise Care Hospital",
        facility_type: "Hospital",
        address: "SG Highway, Ahmedabad",
        city: "Ahmedabad",
        state: "Gujarat",
        postal_code: "380015",
        contact_email: DEMO.users.facilityAdmin.email,
        contact_phone: "+91-9000000001",
        created_by: facilityAdmin.id,
      },
    ],
    "id",
  );

  await upsert(
    "facility_users",
    [
      {
        facility_id: DEMO.ids.facility,
        user_id: facilityAdmin.id,
        membership_role: "owner",
      },
      {
        facility_id: DEMO.ids.facility,
        user_id: admin.id,
        membership_role: "admin",
      },
    ],
    "facility_id,user_id",
  );

  await upsert(
    "licenses",
    [
      {
        id: DEMO.ids.licenseA,
        worker_id: workerA.id,
        license_type: "CNA License",
        license_number: "CNA-GJ-1001",
        issuing_authority: "Gujarat Nursing Council",
        issue_date: "2024-01-15",
        expiry_date: "2027-01-14",
        storage_path: "demo/licenses/worker-a-cna.pdf",
        verification_status: "verified",
      },
      {
        id: DEMO.ids.licenseB,
        worker_id: workerB.id,
        license_type: "RN License",
        license_number: "RN-GJ-2001",
        issuing_authority: "Gujarat Nursing Council",
        issue_date: "2023-06-01",
        expiry_date: "2026-05-31",
        storage_path: "demo/licenses/worker-b-rn.pdf",
        verification_status: "verified",
      },
    ],
    "id",
  );

  await upsert(
    "certifications",
    [
      {
        id: DEMO.ids.certA,
        worker_id: workerA.id,
        certification_type: "BLS",
        issuer: "AHA",
        issue_date: "2025-01-10",
        expiry_date: "2027-01-10",
        storage_path: "demo/certifications/worker-a-bls.pdf",
        verification_status: "verified",
      },
      {
        id: DEMO.ids.certB,
        worker_id: workerB.id,
        certification_type: "ACLS",
        issuer: "AHA",
        issue_date: "2024-11-05",
        expiry_date: "2026-11-05",
        storage_path: "demo/certifications/worker-b-acls.pdf",
        verification_status: "verified",
      },
    ],
    "id",
  );

  await upsert(
    "availability",
    [
      {
        id: DEMO.ids.availA1,
        worker_id: workerA.id,
        day_of_week: 1,
        start_time: "08:00",
        end_time: "16:00",
        preference_note: "Day shift preferred",
      },
      {
        id: DEMO.ids.availA2,
        worker_id: workerA.id,
        day_of_week: 5,
        start_time: "20:00",
        end_time: "23:00",
        preference_note: "Friday evening available",
      },
      {
        id: DEMO.ids.availB1,
        worker_id: workerB.id,
        day_of_week: 2,
        start_time: "09:00",
        end_time: "17:00",
        preference_note: "Tuesday day availability",
      },
    ],
    "id",
  );

  await upsert(
    "shifts",
    [
      {
        id: DEMO.ids.shiftCompleted,
        facility_id: DEMO.ids.facility,
        title: "Night Shift - Med Surg",
        department: "Medical-Surgical",
        specialty_required: "CNA",
        shift_date: "2026-03-12",
        start_time: "20:00",
        end_time: "23:00",
        hourly_rate: 52,
        workers_needed: 1,
        location: "Ahmedabad",
        description: "Completed demo shift for lifecycle walkthrough.",
        urgent_flag: false,
        status: "completed",
        created_by: facilityAdmin.id,
      },
      {
        id: DEMO.ids.shiftOpen,
        facility_id: DEMO.ids.facility,
        title: "Day Shift - ICU",
        department: "ICU",
        specialty_required: "RN",
        shift_date: "2026-03-20",
        start_time: "08:00",
        end_time: "16:00",
        hourly_rate: 65,
        workers_needed: 2,
        location: "Ahmedabad",
        description: "Open shift for application demo.",
        urgent_flag: true,
        status: "open",
        created_by: facilityAdmin.id,
      },
    ],
    "id",
  );

  await upsert(
    "applications",
    [
      {
        id: DEMO.ids.appAccepted,
        shift_id: DEMO.ids.shiftCompleted,
        worker_id: workerA.id,
        application_status: "accepted",
      },
      {
        id: DEMO.ids.appApplied,
        shift_id: DEMO.ids.shiftOpen,
        worker_id: workerB.id,
        application_status: "applied",
      },
    ],
    "id",
  );

  await upsert(
    "assignments",
    [
      {
        id: DEMO.ids.assignmentCompleted,
        shift_id: DEMO.ids.shiftCompleted,
        worker_id: workerA.id,
        application_id: DEMO.ids.appAccepted,
        assignment_status: "completed",
      },
    ],
    "id",
  );

  await upsert(
    "conversations",
    [
      {
        id: DEMO.ids.conversationMain,
        shift_id: DEMO.ids.shiftCompleted,
        facility_id: DEMO.ids.facility,
        created_by: facilityAdmin.id,
      },
    ],
    "id",
  );

  await upsert(
    "conversation_participants",
    [
      { conversation_id: DEMO.ids.conversationMain, user_id: workerA.id },
      { conversation_id: DEMO.ids.conversationMain, user_id: facilityAdmin.id },
    ],
    "conversation_id,user_id",
  );

  await upsert(
    "messages",
    [
      {
        id: DEMO.ids.messageA,
        conversation_id: DEMO.ids.conversationMain,
        sender_id: facilityAdmin.id,
        body: "Please report to Med Surg front desk by 7:45 PM.",
      },
      {
        id: DEMO.ids.messageB,
        conversation_id: DEMO.ids.conversationMain,
        sender_id: workerA.id,
        body: "Confirmed. I will arrive 15 minutes early.",
      },
    ],
    "id",
  );

  await upsert(
    "timesheets",
    [
      {
        assignment_id: DEMO.ids.assignmentCompleted,
        clock_in_time: "2026-03-12T14:30:00.000Z",
        clock_out_time: "2026-03-12T17:30:00.000Z",
      },
    ],
    "assignment_id",
  );

  await upsert(
    "reviews",
    [
      {
        id: DEMO.ids.reviewFacilityToWorker,
        assignment_id: DEMO.ids.assignmentCompleted,
        reviewer_id: facilityAdmin.id,
        reviewee_id: workerA.id,
        rating: 5,
        review_text: "Excellent punctuality and patient care.",
      },
      {
        id: DEMO.ids.reviewWorkerToFacility,
        assignment_id: DEMO.ids.assignmentCompleted,
        reviewer_id: workerA.id,
        reviewee_id: facilityAdmin.id,
        rating: 4,
        review_text: "Clear instructions and supportive shift team.",
      },
    ],
    "id",
  );

  const tableChecks = [
    "user_roles",
    "worker_profiles",
    "facility_profiles",
    "facilities",
    "facility_users",
    "licenses",
    "certifications",
    "availability",
    "shifts",
    "applications",
    "assignments",
    "conversations",
    "conversation_participants",
    "messages",
    "timesheets",
    "reviews",
  ];

  console.log("Seed complete. Row counts:");
  for (const table of tableChecks) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      throw new Error(`Unable to count ${table}: ${error.message}`);
    }
    console.log(`- ${table}: ${count ?? 0}`);
  }

  console.log("Demo users:");
  console.log(`- Worker A: ${DEMO.users.workerA.email}`);
  console.log(`- Worker B: ${DEMO.users.workerB.email}`);
  console.log(`- Facility Admin: ${DEMO.users.facilityAdmin.email}`);
  console.log(`- Admin: ${DEMO.users.admin.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
