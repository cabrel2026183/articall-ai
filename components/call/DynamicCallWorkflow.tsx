"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Workflow = {
  id: string;
  trade: string;
  name: string;
};

type WorkflowQuestion = {
  id: string;
  workflow_id: string;
  question: string;
  question_key: string;
  position: number;
};

type WorkflowAnswer = {
  id: string;
  question_id: string;
  label: string;
  value: string;
  next_question_key: string | null;
  intervention_label: string | null;
  urgency: string | null;
  skill: string | null;
  materials: string[] | null;
  diagnostic_hint: string | null;
client_instruction: string | null;
};

type WorkflowResult = {
  intervention: string;
  urgency: string;
  skill: string;
  materials: string[];
  diagnostic: string;
clientInstructions: string[];
  summary: string;
};
type DynamicCallWorkflowProps = {
  trade?: string;
  propertyType?: string;

  onResultChange?: (
    result: WorkflowResult
  ) => void;
};

export default function DynamicCallWorkflow({
  trade = "plomberie",
  propertyType = "",
  onResultChange,
}: DynamicCallWorkflowProps) {

  const [workflow, setWorkflow] =
    useState<Workflow | null>(null);

  const [questions, setQuestions] =
    useState<WorkflowQuestion[]>([]);

  const [answers, setAnswers] =
    useState<WorkflowAnswer[]>([]);

  const [currentQuestionKey, setCurrentQuestionKey] =
    useState<string | null>(null);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<string, WorkflowAnswer>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<WorkflowResult>({
      intervention: "",
      urgency: "",
      skill: "",
      materials: [],
      diagnostic: "",
clientInstructions: [],
      summary: "",
    });

  useEffect(() => {
    chargerWorkflow();
  }, [trade]);

  async function chargerWorkflow() {
    setLoading(true);
    setError("");

    setWorkflow(null);
    setQuestions([]);
    setAnswers([]);
    setSelectedAnswers({});
    setCurrentQuestionKey(null);

    const {
      data: workflowData,
      error: workflowError,
    } = await supabase
      .from("service_workflows")
      .select("id, trade, name")
      .eq("trade", trade)
      .eq("active", true)
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle<Workflow>();

    if (workflowError) {
      console.error(
        "Erreur workflow :",
        workflowError
      );

      setError(workflowError.message);
      setLoading(false);
      return;
    }

    if (!workflowData) {
      setError(
        `Aucun questionnaire actif pour le métier "${trade}".`
      );
      setLoading(false);
      return;
    }

    setWorkflow(workflowData);

    const {
      data: questionsData,
      error: questionsError,
    } = await supabase
      .from("workflow_questions")
      .select("*")
      .eq(
        "workflow_id",
        workflowData.id
      )
      .order("position", {
        ascending: true,
      });

    if (questionsError) {
      console.error(
        "Erreur questions :",
        questionsError
      );

      setError(
        questionsError.message
      );

      setLoading(false);
      return;
    }

    const questionsFinales =
      (questionsData as WorkflowQuestion[]) ||
      [];

    setQuestions(
      questionsFinales
    );

    if (
      questionsFinales.length === 0
    ) {
      setError(
        "Ce questionnaire ne contient aucune question."
      );
      setLoading(false);
      return;
    }

    const questionIds =
      questionsFinales.map(
        (question) => question.id
      );

    const {
      data: answersData,
      error: answersError,
    } = await supabase
      .from("workflow_answers")
      .select("*")
      .in(
        "question_id",
        questionIds
      );

    if (answersError) {
      console.error(
        "Erreur réponses :",
        answersError
      );

      setError(
        answersError.message
      );

      setLoading(false);
      return;
    }

    setAnswers(
      (answersData as WorkflowAnswer[]) ||
        []
    );

    setCurrentQuestionKey(
      questionsFinales[0].question_key
    );

    setLoading(false);
  }

  const currentQuestion =
    useMemo(() => {
      if (!currentQuestionKey) {
        return null;
      }

      return (
        questions.find(
          (question) =>
            question.question_key ===
            currentQuestionKey
        ) || null
      );
    }, [
      questions,
      currentQuestionKey,
    ]);

  const currentAnswers =
    useMemo(() => {
      if (!currentQuestion) {
        return [];
      }

      return answers.filter(
        (answer) =>
          answer.question_id ===
          currentQuestion.id
      );
    }, [
      answers,
      currentQuestion,
    ]);

  function choisirReponse(
    answer: WorkflowAnswer
  ) {
    if (!currentQuestion) return;

    const nouvellesReponses = {
      ...selectedAnswers,

      [currentQuestion.question_key]:
        answer,
    };

    setSelectedAnswers(
      nouvellesReponses
    );

    const prochainResultat =
      construireResultat(
        nouvellesReponses
      );

    setResult(
      prochainResultat
    );

    onResultChange?.(
      prochainResultat
    );

    let prochaineQuestion =
  answer.next_question_key;

// Adaptation du parcours fuite au type de logement
if (
  currentQuestion.question_key === "fuite_type"
) {
  if (
    answer.value === "interieur" &&
    propertyType === "appartement"
  ) {
    prochaineQuestion =
      "fuite_interieur_appartement";
  }

  if (
    answer.value === "interieur" &&
    propertyType === "maison"
  ) {
    prochaineQuestion =
      "fuite_interieur_maison";
  }

  if (
    answer.value === "interieur"&&
    propertyType === "appartement"
  ) {
    prochaineQuestion =
      "fuite_exterieur_appartement";
  }

  if (
    answer.value === "exterieur" &&
    propertyType === "maison"
  ) {
    prochaineQuestion =
      "fuite_exterieur_maison";
  }
}

// 🏢 Appartement : plusieurs évacuations touchées
// → vérifier si le problème peut être collectif
if (
  currentQuestion.question_key === "canalisation_etendue" &&
  answer.value === "plusieurs" &&
  propertyType === "appartement"
) {
  prochaineQuestion = "canalisation_collectif";
}

if (prochaineQuestion) {
  setCurrentQuestionKey(
    prochaineQuestion
  );
} else {
  setCurrentQuestionKey(null);
}
  }

  function construireResultat(
    selections: Record<
      string,
      WorkflowAnswer
    >
  ): WorkflowResult {
    const valeurs =
      Object.values(selections);

    let intervention = "";
    let urgence = "";
    let skill = "";
    let diagnostic = "";

const clientInstructions =
  new Set<string>();

    const materials =
      new Set<string>();

    valeurs.forEach(
  (answer) => {
    if (answer.intervention_label) {
      intervention =
        answer.intervention_label;
    }

    if (answer.urgency) {
      urgence =
        answer.urgency;
    }

    if (answer.skill) {
      skill =
        answer.skill;
    }

    // 🧠 Diagnostic probable
    if (answer.diagnostic_hint) {
      diagnostic =
        answer.diagnostic_hint;
    }

    // 🛟 Consignes données au client
    if (answer.client_instruction) {
      clientInstructions.add(
        answer.client_instruction
      );
    }

    // 🧰 Matériel recommandé
    (
      answer.materials || []
    ).forEach(
      (material) =>
        materials.add(material)
    );
  }
);

    const summary = valeurs
      .map(
        (answer) => answer.label
      )
      .join(" → ");

    return {
  intervention,
  urgency: urgence,
  skill,
  materials:
    Array.from(materials),
  diagnostic,
  clientInstructions:
    Array.from(clientInstructions),
  summary,
};
  }

  function recommencer() {
    if (
      questions.length === 0
    ) {
      return;
    }

    setSelectedAnswers({});

    setResult({
      intervention: "",
      urgency: "",
      skill: "",
      materials: [],
      diagnostic: "",
clientInstructions: [],
      summary: "",
    });

    setCurrentQuestionKey(
      questions[0].question_key
    );

    onResultChange?.({
      intervention: "",
      urgency: "",
      skill: "",
      materials: [],
      diagnostic: "",
clientInstructions: [],
      summary: "",
    });
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <p
          style={{
            margin: 0,
            color: "#64748b",
          }}
        >
          Chargement du questionnaire
          métier...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          ...containerStyle,
          background: "#fef2f2",
          border:
            "1px solid #fecaca",
        }}
      >
        <strong
          style={{
            color: "#b91c1c",
          }}
        >
          Questionnaire indisponible
        </strong>

        <p
          style={{
            marginBottom: 0,
            color: "#b91c1c",
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "#2563eb",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
              marginBottom: "5px",
            }}
          >
            🤖 Assistant métier
          </div>

          <h3
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "20px",
            }}
          >
            {workflow?.name}
          </h3>
        </div>

        {Object.keys(
          selectedAnswers
        ).length > 0 && (
          <button
            type="button"
            onClick={recommencer}
            style={{
              padding:
                "8px 11px",
              borderRadius:
                "8px",
              border:
                "1px solid #cbd5e1",
              background:
                "white",
              color:
                "#475569",
              fontWeight: 700,
              cursor:
                "pointer",
            }}
          >
            ↻ Recommencer
          </button>
        )}
      </div>

      {currentQuestion ? (
        <>
          <div
            style={{
              marginBottom:
                "15px",
            }}
          >
            <strong
              style={{
                display:
                  "block",
                color:
                  "#0f172a",
                fontSize:
                  "17px",
              }}
            >
              {currentQuestion.question}
            </strong>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "10px",
            }}
          >
            {currentAnswers.map(
              (answer) => (
                <button
                  key={
                    answer.id
                  }
                  type="button"
                  onClick={() =>
                    choisirReponse(
                      answer
                    )
                  }
                  style={{
                    padding:
                      "14px",
                    borderRadius:
                      "11px",
                    border:
                      "1px solid #cbd5e1",
                    background:
                      "white",
                    color:
                      "#334155",
                    fontWeight:
                      700,
                    cursor:
                      "pointer",
                    textAlign:
                      "left",
                  }}
                >
                  {answer.label}
                </button>
              )
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            padding: "16px",
            borderRadius:
              "12px",
            background:
              "#dcfce7",
            border:
              "1px solid #bbf7d0",
          }}
        >
          <strong
            style={{
              color:
                "#166534",
            }}
          >
            ✓ Diagnostic terminé
          </strong>
        </div>
      )}

      {Object.keys(
        selectedAnswers
      ).length > 0 && (
        <div
          style={{
            marginTop: "22px",
            paddingTop: "20px",
            borderTop:
              "1px solid #e2e8f0",
          }}
        >
          <h4
            style={{
              margin:
                "0 0 12px",
              color:
                "#0f172a",
            }}
          >
            Synthèse de l'appel
          </h4>

          {result.summary && (
            <ResultLine
              label="Parcours"
              value={
                result.summary
              }
            />
          )}

          {result.intervention && (
            <ResultLine
              label="🔧 Intervention"
              value={
                result.intervention
              }
            />
          )}

          {result.diagnostic && (
  <ResultLine
    label="🧠 Diagnostic probable"
    value={result.diagnostic}
  />
)}

          {result.urgency && (
            <ResultLine
              label="⚠️ Urgence"
              value={
                result.urgency
              }
            />
          )}

          {result.skill && (
            <ResultLine
              label="👷 Compétence"
              value={
                result.skill
              }
            />
          )}

          {result.clientInstructions.length > 0 && (
  <div
    style={{
      marginTop: "15px",
      padding: "14px",
      borderRadius: "12px",
      background: "#fff7ed",
      border: "1px solid #fed7aa",
    }}
  >
    <strong
      style={{
        display: "block",
        marginBottom: "8px",
        color: "#9a3412",
      }}
    >
      🛟 Consignes à donner au client
    </strong>

    <ul
      style={{
        margin: 0,
        paddingLeft: "20px",
        color: "#7c2d12",
      }}
    >
      {result.clientInstructions.map(
        (instruction) => (
          <li
            key={instruction}
            style={{
              marginBottom: "5px",
            }}
          >
            {instruction}
          </li>
        )
      )}
    </ul>
  </div>
)}

          {result.materials.length >
            0 && (
            <div
              style={{
                marginTop:
                  "15px",
              }}
            >
              <strong
                style={{
                  display:
                    "block",
                  marginBottom:
                    "8px",
                  color:
                    "#475569",
                }}
              >
                🧰 Matériel conseillé
              </strong>

              <div
                style={{
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap: "7px",
                }}
              >
                {result.materials.map(
                  (material) => (
                    <span
                      key={
                        material
                      }
                      style={{
                        padding:
                          "7px 10px",
                        borderRadius:
                          "999px",
                        background:
                          "#eff6ff",
                        color:
                          "#1d4ed8",
                        fontSize:
                          "13px",
                        fontWeight:
                          700,
                      }}
                    >
                      {material}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "150px 1fr",
        gap: "15px",
        padding: "8px 0",
      }}
    >
      <strong
        style={{
          color: "#64748b",
        }}
      >
        {label}
      </strong>

      <span
        style={{
          color: "#0f172a",
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};