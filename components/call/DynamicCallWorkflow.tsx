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
  problem?: string;

  onResultChange?: (
    result: WorkflowResult
  ) => void;
};

export default function DynamicCallWorkflow({
  trade = "plomberie",
  propertyType = "",
  problem = "",
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

  const [detectionAuto, setDetectionAuto] =
    useState<string | null>(null);

  const [detectionSansResultat, setDetectionSansResultat] =
    useState(false);

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

  // Règles de détection automatique à partir du texte du problème.
  // Chaque étape référence uniquement une "value" : la question réelle
  // à laquelle elle s'applique est résolue dynamiquement, en tenant
  // compte du type de logement (comme le ferait un agent qui répond
  // manuellement).
  const REGLES_AUTO: {
    motsCles: string[];
    label: string;
    etapes: { value: string }[];
  }[] = [
    {
      motsCles: ["lavabo"],
      label: "fuite au lavabo",
      etapes: [
        { value: "fuite" },
        { value: "interieure" },
        { value: "lavabo" },
      ],
    },
    {
      motsCles: ["evier", "évier"],
      label: "fuite à l'évier",
      etapes: [
        { value: "fuite" },
        { value: "interieure" },
        { value: "evier" },
      ],
    },
    {
      motsCles: [
        "chauffe-eau",
        "chauffe eau",
        "ballon d'eau chaude",
        "cumulus",
      ],
      label: "problème de chauffe-eau",
      etapes: [{ value: "chauffe_eau" }],
    },
    {
      motsCles: [
        "robinet qui fuit",
        "robinet fuit",
        "fuite du robinet",
        "fuite au robinet",
      ],
      label: "fuite de robinetterie",
      etapes: [
        { value: "robinetterie" },
        { value: "fuite" },
      ],
    },
    {
      motsCles: [
        "toilette bouchée",
        "toilette bouché",
        "wc bouché",
        "wc bouchée",
        "wc bouche",
      ],
      label: "canalisation bouchée (WC)",
      etapes: [
        { value: "canalisation_bouchee" },
        { value: "wc" },
      ],
    },
    {
      motsCles: [
        "canalisation bouchée",
        "canalisation bouchee",
        "évacuation bouchée",
        "evacuation bouchee",
        "tuyau bouché",
        "tuyau bouche",
      ],
      label: "canalisation bouchée",
      etapes: [{ value: "canalisation_bouchee" }],
    },
  ];

  // Reproduit exactement les mêmes règles de branchement que
  // choisirReponse(), pour que la détection automatique emprunte le
  // même chemin que si l'agent avait cliqué les réponses lui-même.
  function resoudreProchaineQuestion(
    questionKeyActuelle: string,
    answer: WorkflowAnswer
  ): string | null {
    let prochaine = answer.next_question_key;

    if (questionKeyActuelle === "fuite_type") {
      if (
        answer.value === "interieure" &&
        propertyType === "appartement"
      ) {
        prochaine = "fuite_interieur_appartement";
      }

      if (
        answer.value === "interieure" &&
        propertyType === "maison"
      ) {
        prochaine = "fuite_interieur_maison";
      }

      if (
        answer.value === "exterieure" &&
        propertyType === "appartement"
      ) {
        prochaine = "fuite_exterieur_appartement";
      }

      if (
        answer.value === "exterieure" &&
        propertyType === "maison"
      ) {
        prochaine = "fuite_exterieur_maison";
      }
    }

    if (
      questionKeyActuelle === "canalisation_etendue" &&
      answer.value === "plusieurs" &&
      propertyType === "appartement"
    ) {
      prochaine = "canalisation_collectif";
    }

    return prochaine;
  }

  function tenterDetectionAutomatique(
    texteProbleme: string,
    questionsListe: WorkflowQuestion[],
    answersListe: WorkflowAnswer[]
  ): {
    reponsesPreRemplies: Record<string, WorkflowAnswer>;
    questionDepart: string;
    label: string;
  } | null {
    if (!texteProbleme.trim()) return null;

    const texte = texteProbleme.toLowerCase();

    for (const regle of REGLES_AUTO) {
      const correspond = regle.motsCles.some((mot) =>
        texte.includes(mot)
      );

      if (!correspond) continue;

      const reponsesPreRemplies: Record<
        string,
        WorkflowAnswer
      > = {};

      let questionKeyActuelle: string | null =
        "probleme_principal";

      for (const etape of regle.etapes) {
        if (!questionKeyActuelle) break;

        const question = questionsListe.find(
          (q) => q.question_key === questionKeyActuelle
        );

        if (!question) {
          questionKeyActuelle = null;
          break;
        }

        const answer = answersListe.find(
          (a) =>
            a.question_id === question.id &&
            a.value === etape.value
        );

        if (!answer) {
          questionKeyActuelle = null;
          break;
        }

        reponsesPreRemplies[questionKeyActuelle] = answer;

        questionKeyActuelle = resoudreProchaineQuestion(
          questionKeyActuelle,
          answer
        );
      }

      if (questionKeyActuelle) {
        return {
          reponsesPreRemplies,
          questionDepart: questionKeyActuelle,
          label: regle.label,
        };
      }
    }

    return null;
  }

  function lancerDetectionAutomatique(
    questionsListe: WorkflowQuestion[],
    answersListe: WorkflowAnswer[]
  ) {
    const detection = tenterDetectionAutomatique(
      problem,
      questionsListe,
      answersListe
    );

    if (!detection) {
      return false;
    }

    setSelectedAnswers(detection.reponsesPreRemplies);
    setCurrentQuestionKey(detection.questionDepart);
    setDetectionAuto(detection.label);

    const resultatInitial = construireResultat(
      detection.reponsesPreRemplies
    );

    setResult(resultatInitial);
    onResultChange?.(resultatInitial);

    return true;
  }

  useEffect(() => {
    let annule = false;

    chargerWorkflow(() => annule);

    return () => {
      annule = true;
    };
  }, [trade]);

  async function chargerWorkflow(
    estAnnule: () => boolean
  ) {
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

    if (estAnnule()) return;

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

    if (estAnnule()) return;

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

    if (estAnnule()) return;

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

    const answersFinales =
      (answersData as WorkflowAnswer[]) || [];

    setAnswers(answersFinales);

    const detectionReussie =
      lancerDetectionAutomatique(
        questionsFinales,
        answersFinales
      );

    if (!detectionReussie) {
      setCurrentQuestionKey(
        questionsFinales[0].question_key
      );
    }

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
      resoudreProchaineQuestion(
        currentQuestion.question_key,
        answer
      );

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
    setDetectionAuto(null);
    setDetectionSansResultat(false);

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
        ).length > 0 ? (
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
        ) : (
          problem.trim() && (
            <button
              type="button"
              onClick={() => {
                const trouve = lancerDetectionAutomatique(
                  questions,
                  answers
                );
                setDetectionSansResultat(!trouve);
              }}
              style={{
                padding: "8px 11px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "white",
                color: "#475569",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🔍 Analyser la description
            </button>
          )
        )}
      </div>

      {detectionSansResultat && !detectionAuto && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Aucune correspondance trouvée dans la description —
          le questionnaire complet reste disponible ci-dessous.
        </div>
      )}

      {detectionAuto && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            fontSize: "13px",
            color: "#1e40af",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span>
            🔍 Détecté automatiquement à partir de la
            description : <strong>{detectionAuto}</strong>
          </span>

          <button
            type="button"
            onClick={recommencer}
            style={{
              border: "none",
              background: "transparent",
              color: "#1e40af",
              fontWeight: 700,
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Ce n'est pas ça ?
          </button>
        </div>
      )}

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