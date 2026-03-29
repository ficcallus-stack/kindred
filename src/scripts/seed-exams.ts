import { db } from "../db";
import { certificationExams, examQuestions } from "../db/schema";
import { eq } from "drizzle-orm";

async function seedExams() {
  console.log("🌱 Seeding Certification Exams...");

  // 1. Create the Global Care Standards Exam
  const [exam] = await db.insert(certificationExams).values({
    certificationType: "standards_program",
    title: "Global Caregiver Standards Exam",
    description: "Validate your expertise in premium childcare, safety protocols, and developmental support.",
    totalMarks: 100,
    passPercentage: 75,
    timeLimit: 60,
    price: 4500, // $45.00
    retakePrice: 500, // $5.00
  }).onConflictDoUpdate({
    target: [certificationExams.certificationType],
    set: { title: "Global Caregiver Standards Exam", price: 4500 }
  }).returning();

  console.log(`✅ Exam created: ${exam.title} (${exam.id})`);

  // 2. Clear existing questions for this exam (to avoid duplicates on re-run)
  await db.delete(examQuestions).where(eq(examQuestions.examId, exam.id));

  // 3. Add Questions
  const questions = [
    // Page 1: Core Safety & Emergency Response (30 Marks)
    {
      examId: exam.id,
      page: 1,
      order: 1,
      marks: 10,
      text: "Describe the 'ABC' of safe infant sleep and why it is critical for SIDS prevention."
    },
    {
      examId: exam.id,
      page: 1,
      order: 2,
      marks: 10,
      text: "What are the first three steps you should take if a child in your care begins choking and is unable to cry or cough?"
    },
    {
      examId: exam.id,
      page: 1,
      order: 3,
      marks: 10,
      text: "Explain how to identify and respond to a mild allergic reaction versus anaphylaxis in a toddler."
    },
    // Page 2: Nutrition & Health (25 Marks)
    {
      examId: exam.id,
      page: 2,
      order: 1,
      marks: 10,
      text: "A 2-year-old refuses to eat lunch. Describe your strategy for encouraging healthy eating without creating a power struggle."
    },
    {
      examId: exam.id,
      page: 2,
      order: 2,
      marks: 5,
      text: "List 5 common household choking hazards for children under age 3 that are often overlooked."
    },
    {
      examId: exam.id,
      page: 2,
      order: 3,
      marks: 10,
      text: "Explain the importance of 'cross-contamination' awareness when preparing meals for a child with a known peanut allergy."
    },
    // Page 3: Early Childhood Development (25 Marks)
    {
      examId: exam.id,
      page: 3,
      order: 1,
      marks: 10,
      text: "Define 'Positive Discipline' and provide a specific example of how you would use it to handle a tantrum in a 4-year-old."
    },
    {
      examId: exam.id,
      page: 3,
      order: 2,
      marks: 10,
      text: "Describe three age-appropriate sensory activities for a 6-month-old infant to support cognitive growth."
    },
    {
      examId: exam.id,
      page: 3,
      order: 3,
      marks: 5,
      text: "Why is 'tummy time' important, and how would you encourage a baby who resists being on their stomach?"
    },
    // Page 4: Professional Conduct & Household Management (20 Marks)
    {
      examId: exam.id,
      page: 4,
      order: 1,
      marks: 10,
      text: "How do you handle a situation where a parent's instructions for a child's bedtime conflict with established safety standards (e.g., blanket in an infant's crib)?"
    },
    {
      examId: exam.id,
      page: 4,
      order: 2,
      marks: 10,
      text: "Describe your process for communicating a child's daily highlights and any concerns to parents at the end of a shift."
    }
  ];

  await db.insert(examQuestions).values(questions);
  console.log(`✅ ${questions.length} questions seeded.`);
}

seedExams().catch(console.error);
