export type Article = {
  slug: string;
  titre: string;
  extrait: string;
  categorie: string;
  datePublication: string;
  tempsLecture: string;
  contenu: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "cout-reel-appels-manques",
    titre: "Le vrai coût d'un appel manqué pour un artisan",
    extrait:
      "Un appel manqué n'est pas juste une sonnerie ratée. C'est souvent un client qui appelle déjà le concurrent d'à côté. Voici comment évaluer ce que ça vous coûte réellement.",
    categorie: "Gestion d'activité",
    datePublication: "2026-08-01",
    tempsLecture: "4 min",
    contenu: [
      "Quand on est sur une intervention, sous un évier ou en haut d'une échelle, le téléphone qui sonne dans la poche n'est pas toujours une priorité. C'est humain, et c'est même souvent la bonne décision sur le moment : le client devant vous mérite votre attention complète.",
      "Le problème, c'est ce qui se passe après. La plupart des personnes qui appellent un artisan pour une urgence — une fuite, une panne électrique, une porte claquée — n'attendent pas. Si personne ne décroche, elles raccrochent et composent le numéro suivant sur leur liste, ou tapent \"plombier près de moi\" dans leur moteur de recherche. Le temps que vous rappeliez, le rendez-vous est souvent déjà pris ailleurs.",
      "Ce qui rend ce coût difficile à évaluer, c'est qu'il est invisible. Un chiffre d'affaires perdu ne laisse pas de trace dans votre comptabilité — contrairement à une facture impayée ou un devis refusé, vous ne verrez jamais la ligne \"client parti chez le concurrent parce que je n'ai pas décroché\". Beaucoup d'artisans sous-estiment ce phénomène simplement parce qu'ils n'ont aucun moyen de le mesurer.",
      "Une façon simple de s'en faire une idée : pendant une semaine, notez chaque appel manqué que vous remarquez (via l'historique de votre téléphone), puis comparez avec le nombre de rappels que vous avez effectivement pu faire, et combien ont abouti à un rendez-vous. L'écart entre les deux chiffres, multiplié par votre panier moyen, donne une estimation — souvent plus élevée qu'on ne l'imagine.",
      "La solution n'est pas nécessairement de décrocher plus (ce qui n'est simplement pas possible quand on travaille seul sur le terrain), mais de s'assurer qu'un appel manqué ne se transforme pas automatiquement en client perdu — par exemple en captant l'information essentielle même sans décrocher en direct, pour pouvoir recontacter rapidement avec le bon niveau d'urgence en tête.",
    ],
  },
  {
    slug: "signes-automatiser-prise-rdv",
    titre:
      "5 signes qu'il est temps d'automatiser votre prise de rendez-vous",
    extrait:
      "Beaucoup d'artisans indépendants gèrent encore leur planning au feeling, entre deux interventions. Voici les signaux qui montrent que ça commence à coûter cher.",
    categorie: "Organisation",
    datePublication: "2026-08-10",
    tempsLecture: "5 min",
    contenu: [
      "Au démarrage d'une activité, gérer son planning \"à la main\" — un carnet, un tableau, ou simplement sa mémoire — fonctionne très bien. Le volume est faible, on connaît chaque client, et l'improvisation a même ses avantages : de la flexibilité, pas d'outil à apprendre. Le problème, c'est que ce système qui marchait à 5 interventions par semaine craque souvent bien avant qu'on s'en aperçoive vraiment.",
      "Premier signe : vous avez déjà eu un doublon. Deux rendez-vous pris au même horaire, découverts au dernier moment. Ça arrive à tout le monde une fois — c'est quand ça devient récurrent que le système de gestion, pas la mémoire, est en cause.",
      "Deuxième signe : vous passez du temps le soir ou le week-end à réorganiser votre semaine. Si une bonne partie de votre temps \"off\" part dans la gestion administrative plutôt que le repos, l'outil ne vous fait plus gagner de temps, il vous en prend.",
      "Troisième signe : vous ne savez plus vraiment qui fait quoi si vous avez un ou plusieurs techniciens. Sans vue centralisée, la coordination repose sur des appels et des messages, ce qui devient vite fragile dès que l'équipe grandit un peu.",
      "Quatrième signe : un client vous a déjà dit \"je vous avais pourtant appelé\". Rien n'abîme plus la confiance qu'un rendez-vous oublié — même si l'erreur est compréhensible vu la charge de travail.",
      "Cinquième signe : vous refusez des interventions non pas par manque de compétence, mais par manque de visibilité sur votre propre disponibilité. C'est le signal le plus direct que le planning, plus que le travail lui-même, est devenu le facteur limitant de votre activité.",
      "Aucun de ces signes n'est une catastrophe en soi. Mais réunis, ils indiquent qu'un peu de structure — un planning centralisé, visible par toute l'équipe, mis à jour automatiquement — redonnerait du temps et de la sérénité, sans rien retirer à la relation directe avec le client qui fait la force du métier d'artisan.",
    ],
  },
  {
    slug: "diagnostic-telephonique-qui-change-tout",
    titre:
      "Pourquoi un bon diagnostic téléphonique change tout pour un artisan",
    extrait:
      "Les questions posées avant l'intervention comptent presque autant que le savoir-faire sur place. Voici pourquoi, et comment un diagnostic structuré change la donne.",
    categorie: "Métier",
    datePublication: "2026-08-18",
    tempsLecture: "4 min",
    contenu: [
      "Un client qui appelle pour une fuite ne sait généralement pas décrire précisément son problème : \"il y a de l'eau qui coule\" peut vouloir dire mille choses différentes, d'un joint à changer en cinq minutes à une canalisation à ouvrir. Sans les bonnes questions au bon moment, l'artisan part sur le terrain à l'aveugle — et découvre parfois sur place qu'il n'a pas le bon matériel, ou que la situation est bien plus ou bien moins urgente que prévu.",
      "Un diagnostic téléphonique bien mené change cette dynamique du tout au tout. Il ne s'agit pas de remplacer l'expertise du technicien — un diagnostic à distance ne dira jamais avec certitude d'où vient une fuite — mais de collecter suffisamment d'informations pour prioriser correctement, anticiper le matériel nécessaire, et surtout repérer immédiatement les situations qui demandent une intervention urgente : une odeur de gaz, un choc électrique, une fuite qui inonde déjà le sol.",
      "C'est aussi un vrai gain de confiance pour le client. Une personne qui appelle en urgence, souvent stressée, se sent rassurée dès lors qu'on lui pose des questions précises et pertinentes — ça montre du sérieux, même avant l'arrivée du technicien. À l'inverse, un rendez-vous pris à la va-vite, sans aucune qualification, laisse le client dans l'incertitude jusqu'à l'arrivée sur place.",
      "La difficulté, en pratique, c'est que ce questionnement précis demande du temps et de la rigueur — deux ressources rares quand on gère seul son activité entre le téléphone et le terrain. C'est exactement le type de tâche qu'un assistant structuré peut prendre en charge : poser systématiquement les bonnes questions, adaptées au métier et à la situation décrite, sans jamais sauter une étape parce qu'on est pressé ou fatigué.",
    ],
  },
];