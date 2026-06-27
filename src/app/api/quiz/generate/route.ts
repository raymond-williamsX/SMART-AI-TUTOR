import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/gemini/client";
import { searchIndex } from "@/lib/elastic/client";
import { CHUNKS_INDEX } from "@/lib/materials/elastic";

export const dynamic = "force-dynamic";

const MOCK_QUESTIONS = [
  {
    id: "mock-1",
    question: "What is Newton's First Law of Motion?",
    options: [
      "Objects in motion stay in motion unless acted upon by a net external force",
      "Force equals mass times acceleration",
      "Every action has an equal and opposite reaction",
      "Energy is conserved in all processes",
    ],
    correct_answer:
      "Objects in motion stay in motion unless acted upon by a net external force",
    explanation:
      "Newton's First Law, also called the law of inertia, states that an object remains at rest or in uniform motion in a straight line unless acted upon by a net external force.",
  },
  {
    id: "mock-2",
    question: "What is the speed of light in a vacuum?",
    options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"],
    correct_answer: "3×10⁸ m/s",
    explanation:
      "The speed of light in a vacuum is approximately 299,792,458 metres per second, commonly approximated as 3×10⁸ m/s.",
  },
  {
    id: "mock-3",
    question: "What is photosynthesis?",
    options: [
      "The process by which plants use sunlight to produce food",
      "The process of cell division",
      "The process of protein synthesis",
      "The process of DNA replication",
    ],
    correct_answer:
      "The process by which plants use sunlight to produce food",
    explanation:
      "Photosynthesis is the process by which plants, algae, and some bacteria use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.",
  },
  {
    id: "mock-4",
    question: "What does DNA stand for?",
    options: [
      "Deoxyribonucleic Acid",
      "Deoxyribose Nucleotide Acid",
      "Dichloronucleic Acid",
      "Dynamo Nucleotide Amine",
    ],
    correct_answer: "Deoxyribonucleic Acid",
    explanation:
      "DNA stands for Deoxyribonucleic Acid — the molecule that carries genetic instructions in all living organisms.",
  },
  {
    id: "mock-5",
    question: "Which planet is the largest in the Solar System?",
    options: ["Jupiter", "Saturn", "Neptune", "Uranus"],
    correct_answer: "Jupiter",
    explanation:
      "Jupiter is the largest planet in our Solar System, with a mass more than twice that of all other planets combined.",
  },
];

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, requestId, error: { code: "UNAUTHORIZED", message: "You must be signed in." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { materialId, courseId, type = "mcq", count = 5 } = body;

    const clampedCount = Math.min(Math.max(Number(count), 3), 15);

    // Fetch material to get context (file name, etc.)
    let materialContext = "";
    if (materialId) {
      const { data: material } = await supabase
        .from("uploaded_materials")
        .select("file_name, id")
        .eq("id", materialId)
        .eq("user_id", userData.user.id)
        .single();

      if (material) {
        let fullText = "";
        try {
          const chunks = await searchIndex(CHUNKS_INDEX, {
            query: {
              bool: {
                filter: [
                  { term: { document_id: materialId } },
                  { term: { user_id: userData.user.id } }
                ]
              }
            },
            sort: [{ chunk_index: "asc" }],
            size: 20,
            _source: ["chunk_text"]
          });
          const hits = (chunks as any)?.hits?.hits ?? [];
          fullText = hits.map((h: any) => h._source?.chunk_text).join("\n\n");
        } catch (e) {
          console.warn("[quiz:generate] failed to fetch chunks from ElasticSearch", e);
        }

        if (fullText.trim()) {
          materialContext = `The study material is titled: "${material.file_name}". Generate quiz questions STRICTLY based on the following document context:\n\n${fullText.slice(0, 15000)}`;
        } else {
          materialContext = `The study material is titled: "${material.file_name}". Generate quiz questions based on this study material.`;
        }
      }
    } else if (courseId) {
      const { data: course } = await supabase
        .from("courses")
        .select("code, title, description")
        .eq("id", courseId)
        .eq("user_id", userData.user.id)
        .single();

      if (course) {
        materialContext = `The study context is for the course: "${course.code} — ${course.title}" (${course.description ?? "General study"}). Generate educational quiz questions covering the curriculum, main concepts and topics of this course.`;
      }
    }

    const typeLabel =
      type === "mcq"
        ? "multiple-choice"
        : type === "flashcard"
          ? "flashcard"
          : "short-answer";

    const prompt = `You are an expert academic quiz generator. Generate exactly ${clampedCount} ${typeLabel} questions suitable for a student study quiz.
${materialContext ? materialContext : "Generate questions based on general academic knowledge."}

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, just pure JSON):
{
  "questions": [
    {
      "question": "Clear, specific question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
- For ${typeLabel} questions, always include exactly 4 options
- Make questions educational and test genuine understanding
- Vary difficulty (some easy, some medium, some hard)
- Explanations should be concise but informative (1-2 sentences)
- Do NOT include question numbers in the question text`;

    let questions: QuizQuestion[] = [];

    try {
      const result = await generateText(prompt);
      const raw = result.text.trim();

      // Strip any markdown code fences if Gemini wraps the output
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        questions = parsed.questions.slice(0, clampedCount).map(
          (q: any, i: number): QuizQuestion => ({
            id: `q-${requestId}-${i}`,
            question: q.question ?? "Question not available",
            options: Array.isArray(q.options) && q.options.length === 4
              ? q.options
              : ["Option A", "Option B", "Option C", "Option D"],
            correct_answer: q.correct_answer ?? q.options?.[0] ?? "Option A",
            explanation: q.explanation ?? "No explanation provided.",
          })
        );
      }
    } catch (geminiError) {
      console.warn("[quiz:generate] Gemini failed, using mock questions", geminiError);
      questions = MOCK_QUESTIONS.slice(0, clampedCount).map((q, i) => ({
        ...q,
        id: `mock-${requestId}-${i}`,
      }));
    }

    if (questions.length === 0) {
      questions = MOCK_QUESTIONS.slice(0, clampedCount).map((q, i) => ({
        ...q,
        id: `fallback-${requestId}-${i}`,
      }));
    }

    return NextResponse.json({
      success: true,
      requestId,
      data: { questions, type, count: questions.length },
    });
  } catch (err) {
    console.error("[quiz:generate] unexpected error", err);
    return NextResponse.json(
      { success: false, requestId, error: { code: "INTERNAL_ERROR", message: "Failed to generate quiz." } },
      { status: 500 }
    );
  }
}
