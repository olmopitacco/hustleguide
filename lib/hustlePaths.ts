// ─── Explanation i18n ────────────────────────────────────────────────────────

type ExplainT = {
  skills2: (s1: string, s2: string) => string
  skills1: (s: string) => string
  skillsNone: string
  skillsLearnable: string
  timelineFastNeeded: string
  timelineFastAhead: string
  timelineMediumFast: string
  timelineSlow: string
  budgetFreeZero: string
  budgetFreeHasBudget: string
  budgetLow: string
  hoursOk: (h: string) => string
  styleCreative: string
  styleAnalytical: string
  stylePeople: string
  styleAlone: string
  noConflicts: string
  location: (loc: string) => string
  triedBefore: string
  fallback1: string
  fallback2: string
}

const EXPLAIN: Record<string, ExplainT> = {
  en: {
    skills2: (s1, s2) => `you already have ${s1} and ${s2} skills, so you're not starting from zero`,
    skills1: s => `your ${s} background is directly useful here — you won't be learning from scratch`,
    skillsNone: `this path requires no pre-existing skills — everything is learnable in the first 2 weeks`,
    skillsLearnable: `the skills this path needs are learnable quickly — most people pick them up in their first few sessions`,
    timelineFastNeeded: `it's one of the fastest-moving paths available — first payments are realistic within 30 days`,
    timelineFastAhead: `it moves faster than most paths, so you'll likely hit income before your own deadline`,
    timelineMediumFast: `while not instant, this path is faster than most and can still hit your timeline with focused effort`,
    timelineSlow: `the income curve is gradual but compounds — people who stick with it for 3+ months consistently see strong results`,
    budgetFreeZero: `it costs literally nothing to start — no tools, no subscriptions, no upfront investment`,
    budgetFreeHasBudget: `you don't need to spend any of your budget to start — which gives you room to invest later once you're earning`,
    budgetLow: `the startup costs are minimal — under €100 gets you everything you need`,
    hoursOk: h => `it fits cleanly into ${h} per week — you won't feel overwhelmed in week one`,
    styleCreative: `it leans heavily on creative thinking, which matches how you said you prefer to work`,
    styleAnalytical: `it rewards analytical thinking — exactly the kind of work you said you prefer`,
    stylePeople: `it involves regular client interaction, which suits your preference for working with people`,
    styleAlone: `you can do this entirely independently — no team required, no calls if you don't want them`,
    noConflicts: `it doesn't require any of the things you said you hate — you won't be forcing yourself to do work you dread`,
    location: loc => `being based in ${loc} gives you a real local market to tap into before going remote`,
    triedBefore: `unlike what you've tried before, this path doesn't require managing inventory, suppliers, or ads`,
    fallback1: `the overall match with your profile — hours, budget, and goals — is strong`,
    fallback2: `realistic income potential that fits your stated timeline`,
  },
  it: {
    skills2: (s1, s2) => `hai già competenze in ${s1} e ${s2}, quindi non parti da zero`,
    skills1: s => `il tuo background in ${s} è direttamente utile qui — non dovrai imparare tutto da capo`,
    skillsNone: `questo percorso non richiede competenze pregresse — tutto è apprendibile nelle prime 2 settimane`,
    skillsLearnable: `le competenze richieste si imparano rapidamente — la maggior parte delle persone le acquisisce nelle prime sessioni`,
    timelineFastNeeded: `è uno dei percorsi che si muovono più velocemente — i primi guadagni sono realistici entro 30 giorni`,
    timelineFastAhead: `progredisce più velocemente della maggior parte dei percorsi, quindi probabilmente raggiungerai il reddito prima della tua scadenza`,
    timelineMediumFast: `pur non essendo immediato, questo percorso è più veloce di molti altri e può centrare la tua tempistica con impegno costante`,
    timelineSlow: `la curva di reddito è graduale ma si accumula — chi persevera per 3+ mesi vede costantemente risultati solidi`,
    budgetFreeZero: `non costa letteralmente nulla iniziare — nessuno strumento, nessun abbonamento, nessun investimento iniziale`,
    budgetFreeHasBudget: `non hai bisogno di spendere nulla del tuo budget per iniziare — il che ti dà margine per investire in seguito`,
    budgetLow: `i costi iniziali sono minimi — meno di €100 ti dà tutto ciò di cui hai bisogno`,
    hoursOk: h => `si adatta perfettamente a ${h} a settimana — non ti sentirai sopraffatto nella prima settimana`,
    styleCreative: `si basa molto sul pensiero creativo, il che corrisponde al modo in cui hai detto di preferire lavorare`,
    styleAnalytical: `premia il pensiero analitico — esattamente il tipo di lavoro che hai detto di preferire`,
    stylePeople: `prevede un'interazione regolare con i clienti, adatta alla tua preferenza per lavorare con le persone`,
    styleAlone: `puoi farlo in totale autonomia — nessun team richiesto, nessuna chiamata se non la vuoi`,
    noConflicts: `non richiede nessuna delle cose che hai detto di odiare — non ti costringerai a fare un lavoro che temi`,
    location: loc => `essere basato a ${loc} ti dà un vero mercato locale da sfruttare prima di andare online`,
    triedBefore: `a differenza di ciò che hai già provato, questo percorso non richiede gestione di inventario, fornitori o pubblicità`,
    fallback1: `la corrispondenza complessiva con il tuo profilo — ore, budget e obiettivi — è forte`,
    fallback2: `potenziale di reddito realistico che si adatta alla tua tempistica dichiarata`,
  },
  es: {
    skills2: (s1, s2) => `ya tienes habilidades en ${s1} y ${s2}, así que no empiezas desde cero`,
    skills1: s => `tu experiencia en ${s} es directamente útil aquí — no tendrás que aprender desde cero`,
    skillsNone: `este camino no requiere habilidades previas — todo se puede aprender en las primeras 2 semanas`,
    skillsLearnable: `las habilidades necesarias se aprenden rápido — la mayoría las domina en sus primeras sesiones`,
    timelineFastNeeded: `es uno de los caminos más rápidos disponibles — los primeros pagos son realistas en 30 días`,
    timelineFastAhead: `avanza más rápido que la mayoría, así que probablemente alcanzarás ingresos antes de tu fecha límite`,
    timelineMediumFast: `aunque no es inmediato, este camino es más rápido que la mayoría y puede cumplir tu plazo con esfuerzo`,
    timelineSlow: `la curva de ingresos es gradual pero se acumula — quienes persisten 3+ meses ven resultados sólidos`,
    budgetFreeZero: `literalmente no cuesta nada empezar — sin herramientas, sin suscripciones, sin inversión inicial`,
    budgetFreeHasBudget: `no necesitas gastar nada de tu presupuesto para empezar — lo que te da margen para invertir después`,
    budgetLow: `los costes iniciales son mínimos — con menos de €100 tienes todo lo que necesitas`,
    hoursOk: h => `encaja perfectamente en ${h} por semana — no te sentirás abrumado en la primera semana`,
    styleCreative: `se basa mucho en el pensamiento creativo, que coincide con cómo prefieres trabajar`,
    styleAnalytical: `recompensa el pensamiento analítico — exactamente el tipo de trabajo que dijiste preferir`,
    stylePeople: `implica interacción regular con clientes, adecuada para tu preferencia de trabajar con personas`,
    styleAlone: `puedes hacerlo de forma totalmente independiente — sin equipo, sin llamadas si no quieres`,
    noConflicts: `no requiere ninguna de las cosas que dijiste odiar — no te obligarás a hacer trabajo que temes`,
    location: loc => `estar basado en ${loc} te da un mercado local real al que acceder antes de ir online`,
    triedBefore: `a diferencia de lo que has probado antes, este camino no requiere gestionar inventario, proveedores ni anuncios`,
    fallback1: `la coincidencia general con tu perfil — horas, presupuesto y objetivos — es fuerte`,
    fallback2: `potencial de ingresos realista que se ajusta a tu plazo declarado`,
  },
  fr: {
    skills2: (s1, s2) => `vous avez déjà des compétences en ${s1} et ${s2}, donc vous ne partez pas de zéro`,
    skills1: s => `votre expérience en ${s} est directement utile ici — vous n'apprendrez pas depuis zéro`,
    skillsNone: `ce parcours ne nécessite aucune compétence préalable — tout s'apprend dans les 2 premières semaines`,
    skillsLearnable: `les compétences requises s'apprennent rapidement — la plupart les maîtrisent dès les premières sessions`,
    timelineFastNeeded: `c'est l'un des parcours les plus rapides — les premiers revenus sont réalistes dans les 30 jours`,
    timelineFastAhead: `il progresse plus vite que la plupart, donc vous atteindrez probablement vos revenus avant votre échéance`,
    timelineMediumFast: `sans être immédiat, ce parcours est plus rapide que la plupart et peut respecter votre calendrier`,
    timelineSlow: `la courbe de revenus est progressive mais s'accumule — ceux qui persistent 3+ mois voient des résultats solides`,
    budgetFreeZero: `cela ne coûte littéralement rien pour commencer — pas d'outils, pas d'abonnements, pas d'investissement initial`,
    budgetFreeHasBudget: `vous n'avez pas besoin de dépenser votre budget pour commencer — ce qui vous laisse de la marge pour investir plus tard`,
    budgetLow: `les coûts de démarrage sont minimes — moins de €100 suffit pour tout ce dont vous avez besoin`,
    hoursOk: h => `cela s'intègre parfaitement dans ${h} par semaine — vous ne vous sentirez pas dépassé dès la première semaine`,
    styleCreative: `cela s'appuie beaucoup sur la pensée créative, ce qui correspond à votre façon de travailler`,
    styleAnalytical: `cela récompense la pensée analytique — exactement le type de travail que vous préférez`,
    stylePeople: `cela implique des interactions régulières avec les clients, adapté à votre préférence pour travailler avec des personnes`,
    styleAlone: `vous pouvez le faire entièrement de façon autonome — pas d'équipe, pas d'appels si vous ne voulez pas`,
    noConflicts: `cela ne nécessite rien de ce que vous avez dit détester — vous ne vous forcerez pas à faire un travail que vous redoutez`,
    location: loc => `être basé à ${loc} vous donne un vrai marché local à exploiter avant de passer en ligne`,
    triedBefore: `contrairement à ce que vous avez essayé avant, ce parcours ne nécessite pas de gérer des stocks, des fournisseurs ou des publicités`,
    fallback1: `la correspondance globale avec votre profil — heures, budget et objectifs — est forte`,
    fallback2: `un potentiel de revenus réaliste qui correspond à votre calendrier déclaré`,
  },
  de: {
    skills2: (s1, s2) => `du hast bereits Kenntnisse in ${s1} und ${s2}, also fängst du nicht bei null an`,
    skills1: s => `dein Hintergrund in ${s} ist hier direkt nützlich — du musst nicht von Grund auf neu lernen`,
    skillsNone: `dieser Weg erfordert keinerlei Vorkenntnisse — alles kann in den ersten 2 Wochen erlernt werden`,
    skillsLearnable: `die benötigten Fähigkeiten lassen sich schnell erlernen — die meisten beherrschen sie nach wenigen Sitzungen`,
    timelineFastNeeded: `es ist einer der schnellsten verfügbaren Wege — erste Einnahmen sind innerhalb von 30 Tagen realistisch`,
    timelineFastAhead: `er entwickelt sich schneller als die meisten Wege, sodass du wahrscheinlich vor deiner eigenen Frist Einnahmen erzielst`,
    timelineMediumFast: `obwohl nicht sofort, ist dieser Weg schneller als die meisten und kann mit fokussiertem Einsatz deinen Zeitplan einhalten`,
    timelineSlow: `die Einnahmenkurve ist allmählich, aber sie setzt sich fort — wer 3+ Monate dabei bleibt, sieht konstant starke Ergebnisse`,
    budgetFreeZero: `es kostet buchstäblich nichts zu starten — keine Tools, keine Abonnements, keine Anfangsinvestition`,
    budgetFreeHasBudget: `du musst kein Budget ausgeben, um zu starten — das gibt dir Spielraum, später zu investieren`,
    budgetLow: `die Startkosten sind minimal — unter €100 reicht für alles, was du brauchst`,
    hoursOk: h => `es passt sauber in ${h} pro Woche — du wirst dich in der ersten Woche nicht überfordert fühlen`,
    styleCreative: `es setzt stark auf kreatives Denken, was mit deiner bevorzugten Arbeitsweise übereinstimmt`,
    styleAnalytical: `es belohnt analytisches Denken — genau die Art von Arbeit, die du bevorzugst`,
    stylePeople: `es beinhaltet regelmäßige Kundeninteraktion, was deiner Vorliebe für die Arbeit mit Menschen entspricht`,
    styleAlone: `du kannst dies vollständig unabhängig tun — kein Team erforderlich, keine Anrufe wenn du das nicht willst`,
    noConflicts: `es erfordert nichts von dem, was du gesagt hast zu hassen — du wirst dich nicht zu Arbeit zwingen, die du fürchtest`,
    location: loc => `in ${loc} ansässig zu sein gibt dir einen echten lokalen Markt, bevor du online gehst`,
    triedBefore: `anders als bei dem, was du bisher versucht hast, erfordert dieser Weg kein Inventar, keine Lieferanten oder Anzeigen`,
    fallback1: `die Gesamtübereinstimmung mit deinem Profil — Stunden, Budget und Ziele — ist stark`,
    fallback2: `realistisches Einkommenspotenzial, das zu deinem angegebenen Zeitplan passt`,
  },
  pt: {
    skills2: (s1, s2) => `você já tem habilidades em ${s1} e ${s2}, então não está começando do zero`,
    skills1: s => `sua experiência em ${s} é diretamente útil aqui — você não vai aprender do zero`,
    skillsNone: `este caminho não requer habilidades prévias — tudo pode ser aprendido nas primeiras 2 semanas`,
    skillsLearnable: `as habilidades necessárias são aprendidas rapidamente — a maioria as domina nas primeiras sessões`,
    timelineFastNeeded: `é um dos caminhos mais rápidos disponíveis — os primeiros pagamentos são realistas em 30 dias`,
    timelineFastAhead: `avança mais rápido que a maioria, então provavelmente você atingirá renda antes do seu prazo`,
    timelineMediumFast: `embora não seja imediato, este caminho é mais rápido que a maioria e pode cumprir seu cronograma com esforço`,
    timelineSlow: `a curva de renda é gradual mas acumula — quem persiste 3+ meses vê resultados sólidos`,
    budgetFreeZero: `literalmente não custa nada para começar — sem ferramentas, sem assinaturas, sem investimento inicial`,
    budgetFreeHasBudget: `você não precisa gastar nada do seu orçamento para começar — o que te dá margem para investir depois`,
    budgetLow: `os custos iniciais são mínimos — menos de €100 cobre tudo o que você precisa`,
    hoursOk: h => `encaixa perfeitamente em ${h} por semana — você não se sentirá sobrecarregado na primeira semana`,
    styleCreative: `depende muito do pensamento criativo, o que combina com sua forma preferida de trabalhar`,
    styleAnalytical: `recompensa o pensamento analítico — exatamente o tipo de trabalho que você prefere`,
    stylePeople: `envolve interação regular com clientes, adequado para sua preferência de trabalhar com pessoas`,
    styleAlone: `você pode fazer isso de forma totalmente independente — sem equipe, sem chamadas se não quiser`,
    noConflicts: `não requer nada do que você disse odiar — você não se forçará a fazer trabalho que teme`,
    location: loc => `estar baseado em ${loc} te dá um mercado local real para explorar antes de ir online`,
    triedBefore: `ao contrário do que você já tentou, este caminho não requer gerenciar estoque, fornecedores ou anúncios`,
    fallback1: `a correspondência geral com seu perfil — horas, orçamento e objetivos — é forte`,
    fallback2: `potencial de renda realista que se encaixa no seu cronograma declarado`,
  },
  nl: {
    skills2: (s1, s2) => `je hebt al vaardigheden in ${s1} en ${s2}, dus je begint niet bij nul`,
    skills1: s => `je achtergrond in ${s} is hier direct nuttig — je hoeft niet van scratch te leren`,
    skillsNone: `dit pad vereist geen voorkennis — alles is te leren in de eerste 2 weken`,
    skillsLearnable: `de benodigde vaardigheden zijn snel te leren — de meesten beheersen ze na een paar sessies`,
    timelineFastNeeded: `het is een van de snelste beschikbare paden — eerste inkomsten zijn realistisch binnen 30 dagen`,
    timelineFastAhead: `het gaat sneller dan de meeste paden, dus je bereikt waarschijnlijk inkomsten vóór je deadline`,
    timelineMediumFast: `hoewel niet direct, is dit pad sneller dan de meeste en kan je tijdlijn halen met gerichte inzet`,
    timelineSlow: `de inkomstencurve is geleidelijk maar samengesteld — wie 3+ maanden volhoudt ziet consistent sterke resultaten`,
    budgetFreeZero: `het kost letterlijk niets om te beginnen — geen tools, geen abonnementen, geen startinvestering`,
    budgetFreeHasBudget: `je hoeft niets van je budget uit te geven om te beginnen — wat ruimte geeft voor investering later`,
    budgetLow: `de startkosten zijn minimaal — onder €100 heb je alles wat je nodig hebt`,
    hoursOk: h => `het past perfect in ${h} per week — je voelt je niet overweldigd in week één`,
    styleCreative: `het steunt sterk op creatief denken, wat past bij hoe jij liever werkt`,
    styleAnalytical: `het beloont analytisch denken — precies het type werk dat jij prefereert`,
    stylePeople: `het omvat regelmatige klantinteractie, passend bij je voorkeur voor werken met mensen`,
    styleAlone: `je kunt dit volledig zelfstandig doen — geen team nodig, geen gesprekken als je dat niet wilt`,
    noConflicts: `het vereist niets van wat je zei te haten — je dwingt jezelf niet tot werk dat je vreest`,
    location: loc => `gebaseerd zijn in ${loc} geeft je een echte lokale markt om te benutten voor je online gaat`,
    triedBefore: `anders dan wat je eerder hebt geprobeerd, vereist dit pad geen beheer van voorraad, leveranciers of advertenties`,
    fallback1: `de algehele match met je profiel — uren, budget en doelen — is sterk`,
    fallback2: `realistisch inkomstenpotentieel dat past bij je opgegeven tijdlijn`,
  },
  pl: {
    skills2: (s1, s2) => `masz już umiejętności w zakresie ${s1} i ${s2}, więc nie zaczynasz od zera`,
    skills1: s => `twoje doświadczenie w ${s} jest tu bezpośrednio przydatne — nie będziesz uczyć się od podstaw`,
    skillsNone: `ta ścieżka nie wymaga żadnych wcześniejszych umiejętności — wszystkiego można się nauczyć w ciągu pierwszych 2 tygodni`,
    skillsLearnable: `potrzebne umiejętności można szybko opanować — większość osób przyswaja je podczas pierwszych sesji`,
    timelineFastNeeded: `to jedna z najszybszych dostępnych ścieżek — pierwsze zarobki są realistyczne w ciągu 30 dni`,
    timelineFastAhead: `porusza się szybciej niż większość ścieżek, więc prawdopodobnie osiągniesz dochód przed własnym terminem`,
    timelineMediumFast: `choć nie natychmiastowa, ta ścieżka jest szybsza niż większość i może zmieścić się w twoim harmonogramie przy skupionym wysiłku`,
    timelineSlow: `krzywa dochodów jest stopniowa, ale się kumuluje — osoby, które wytrwają 3+ miesiące, konsekwentnie widzą solidne wyniki`,
    budgetFreeZero: `dosłownie nic nie kosztuje, żeby zacząć — żadnych narzędzi, subskrypcji, ani inwestycji początkowej`,
    budgetFreeHasBudget: `nie musisz wydawać żadnego budżetu na start — co daje ci przestrzeń na inwestycje później`,
    budgetLow: `koszty startowe są minimalne — poniżej €100 wystarczy na wszystko, czego potrzebujesz`,
    hoursOk: h => `doskonale pasuje do ${h} tygodniowo — nie poczujesz się przytłoczony w pierwszym tygodniu`,
    styleCreative: `opiera się mocno na kreatywnym myśleniu, co pasuje do twojego preferowanego stylu pracy`,
    styleAnalytical: `nagradza myślenie analityczne — dokładnie ten rodzaj pracy, który preferujesz`,
    stylePeople: `wymaga regularnych kontaktów z klientami, co pasuje do twojej preferencji pracy z ludźmi`,
    styleAlone: `możesz to robić w pełni niezależnie — żadnego zespołu, żadnych rozmów jeśli nie chcesz`,
    noConflicts: `nie wymaga żadnej z rzeczy, których powiedziałeś(-aś) nienawidzić — nie będziesz zmuszać się do pracy, której się obawiasz`,
    location: loc => `bycie w ${loc} daje ci prawdziwy lokalny rynek do wykorzystania przed przejściem online`,
    triedBefore: `w przeciwieństwie do tego, co próbowałeś(-aś) wcześniej, ta ścieżka nie wymaga zarządzania zapasami, dostawcami ani reklamami`,
    fallback1: `ogólne dopasowanie do twojego profilu — godziny, budżet i cele — jest silne`,
    fallback2: `realistyczny potencjał dochodowy dopasowany do twojego harmonogramu`,
  },
}

// Fallback to English if language not found
function getExplain(lang: string): ExplainT {
  return EXPLAIN[lang] ?? EXPLAIN.en
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserProfile = {
  hours_available: string | null
  income_timeline: string | null
  skills: string[] | null
  budget: string | null
  location: string | null
  tried_before: string | null
  preferences: string | null
  hates: string[] | null
}

type HustlePath = {
  name: string
  emoji: string
  description: string
  minHoursPerWeek: number
  firstIncome: 'fast' | 'medium' | 'slow' | 'longterm'
  budgetLevel: 0 | 1 | 2 | 3   // 0=€0, 1=<€100, 2=€100-500, 3=€500+
  relatedSkills: string[]
  workStyles: string[]           // 'Creative work' | 'Analytical work' | 'Working with people' | 'Working alone'
  requires: string[]             // from hates options
  incomeByTimeline: { '30days': string; '1-3months': string; '3-6months': string; longterm: string }
}

export type ScoredPath = HustlePath & {
  score: number
  matchPercent: number
  explanation: string
  incomeRange: string
}

// ─── Path definitions ─────────────────────────────────────────────────────────

const PATHS: HustlePath[] = [
  {
    name: 'Freelance Writing',
    emoji: '✍️',
    description: 'Write articles, blog posts, and web content for businesses and publications. One of the easiest ways to start earning online with zero upfront cost.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Writing'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Writing lots of text'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€1,000–3,000/mo', longterm: '€3,000–8,000/mo' },
  },
  {
    name: 'Copywriting',
    emoji: '📝',
    description: 'Write persuasive sales pages, email sequences, and ads that make people buy. Higher rates than general writing because the output directly drives revenue.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Writing', 'Marketing'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Writing lots of text'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€800–2,500/mo', '3-6months': '€2,000–5,000/mo', longterm: '€5,000–15,000/mo' },
  },
  {
    name: 'Social Media Manager',
    emoji: '📱',
    description: 'Run Instagram, TikTok, and LinkedIn accounts for businesses that don\'t have time to do it themselves. Combine content creation with strategy and scheduling.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Marketing', 'Design', 'Writing'],
    workStyles: ['Creative work', 'Working with people'],
    requires: ['Cold outreach', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€800–2,000/mo', '3-6months': '€1,500–4,000/mo', longterm: '€3,000–8,000/mo' },
  },
  {
    name: 'Graphic Design',
    emoji: '🎨',
    description: 'Create logos, brand identities, social graphics, and marketing materials for businesses using tools like Figma or Canva.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€600–1,800/mo', '3-6months': '€1,500–4,000/mo', longterm: '€4,000–10,000/mo' },
  },
  {
    name: 'Video Editing',
    emoji: '🎬',
    description: 'Edit YouTube videos, short-form reels, and brand ads for creators and businesses. Demand is massive as video content dominates every platform.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€1,200–3,000/mo', longterm: '€3,000–8,000/mo' },
  },
  {
    name: 'UX Design',
    emoji: '🖥️',
    description: 'Design how apps and websites feel to use — wireframes, prototypes, and user flows. High-value skill that bridges design and product thinking.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Design', 'Coding'],
    workStyles: ['Creative work', 'Analytical work'],
    requires: ['Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€1,000–3,000/mo', '3-6months': '€2,000–6,000/mo', longterm: '€5,000–15,000/mo' },
  },
  {
    name: 'Web Development',
    emoji: '💻',
    description: 'Build websites and web apps for clients using code. Strong long-term income potential and one of the most in-demand freelance skills globally.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Coding'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€1,000–3,000/mo', '3-6months': '€2,000–6,000/mo', longterm: '€5,000–15,000/mo' },
  },
  {
    name: 'No-Code App Building',
    emoji: '⚙️',
    description: 'Build web apps, automations, and internal tools using platforms like Bubble, Webflow, or Make — no traditional coding required.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: ['Coding', 'Design'],
    workStyles: ['Creative work', 'Analytical work'],
    requires: ['Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€500–2,000/mo', '3-6months': '€1,500–5,000/mo', longterm: '€4,000–15,000/mo' },
  },
  {
    name: 'SEO Consulting',
    emoji: '🔍',
    description: 'Help businesses rank higher on Google by optimizing their content, site structure, and backlink strategy. Recurring retainer work once you land clients.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Marketing', 'Coding'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Technical work', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€500–2,000/mo', '3-6months': '€1,500–4,000/mo', longterm: '€4,000–10,000/mo' },
  },
  {
    name: 'AI Automation Consulting',
    emoji: '🤖',
    description: 'Help businesses save time and money by building AI-powered workflows and automations using tools like ChatGPT, Make, and Zapier. The hottest niche right now.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Coding', 'Marketing'],
    workStyles: ['Analytical work', 'Working with people'],
    requires: ['Technical work', 'Cold outreach'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€500–2,500/mo', '3-6months': '€2,000–6,000/mo', longterm: '€5,000–20,000/mo' },
  },
  {
    name: 'Virtual Assistant',
    emoji: '🗂️',
    description: 'Handle emails, scheduling, research, and admin tasks remotely for busy entrepreneurs and small business owners. Low barrier to entry with fast first income.',
    minHoursPerWeek: 20,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone', 'Working with people'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€600–1,500/mo', '3-6months': '€1,000–2,500/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Data Entry',
    emoji: '🖱️',
    description: 'Input, clean, and organize data for businesses on platforms like Upwork. Simple to start with no skills needed, though income ceiling is low.',
    minHoursPerWeek: 20,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€200–500/mo', '1-3months': '€300–700/mo', '3-6months': '€400–900/mo', longterm: '€600–1,500/mo' },
  },
  {
    name: 'Bookkeeping',
    emoji: '📊',
    description: 'Track income and expenses for small businesses using tools like QuickBooks or Xero. Steady recurring work once you have clients, no accounting degree needed.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks', 'Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€400–1,500/mo', '3-6months': '€800–2,500/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Tutoring',
    emoji: '🎓',
    description: 'Teach any subject one-on-one to students in your area. If you\'re strong in maths, science, or any academic subject, parents will pay well.',
    minHoursPerWeek: 2,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Teaching'],
    workStyles: ['Working with people'],
    requires: [],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€800–2,000/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Online Tutoring',
    emoji: '🖥️',
    description: 'Teach students remotely via video call on platforms like Preply or Superprof. Reach students worldwide and set your own hours.',
    minHoursPerWeek: 2,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Teaching', 'Languages'],
    workStyles: ['Working with people'],
    requires: ['Being on camera'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€800–2,000/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Language Teaching',
    emoji: '🌍',
    description: 'Teach your native language to learners worldwide on platforms like iTalki or Preply. No formal teaching qualification needed — just fluency.',
    minHoursPerWeek: 2,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Languages'],
    workStyles: ['Working with people'],
    requires: [],
    incomeByTimeline: { '30days': '€200–500/mo', '1-3months': '€400–1,200/mo', '3-6months': '€800–2,000/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Fitness Coaching',
    emoji: '💪',
    description: 'Coach clients on exercise and body transformation online or in person. Build custom programs, check form via video, and help people hit their goals.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Fitness'],
    workStyles: ['Working with people', 'Creative work'],
    requires: ['Being on camera'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€600–1,800/mo', '3-6months': '€1,200–4,000/mo', longterm: '€3,000–10,000/mo' },
  },
  {
    name: 'Nutrition Coaching',
    emoji: '🥗',
    description: 'Help clients improve their diet, lose weight, or hit health goals through personalised meal plans and accountability check-ins.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Fitness'],
    workStyles: ['Working with people'],
    requires: ['Being on camera'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€1,000–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Career Coaching',
    emoji: '🧭',
    description: 'Help people land jobs, get promotions, or switch industries. CVs, interview prep, LinkedIn strategy — huge demand from anxious job seekers.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working with people'],
    requires: ['Cold outreach'],
    incomeByTimeline: { '30days': '€0–400/mo', '1-3months': '€300–1,500/mo', '3-6months': '€800–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Business Consulting',
    emoji: '💼',
    description: 'Advise small businesses on strategy, operations, marketing, and growth. Best suited to people with real business or industry experience.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Marketing', 'Sales'],
    workStyles: ['Analytical work', 'Working with people'],
    requires: ['Cold outreach', 'Managing people'],
    incomeByTimeline: { '30days': '€0–1,000/mo', '1-3months': '€500–3,000/mo', '3-6months': '€1,500–6,000/mo', longterm: '€4,000–20,000/mo' },
  },
  {
    name: 'YouTube Channel',
    emoji: '▶️',
    description: 'Build an audience by publishing videos on a niche topic and monetise through ads, sponsorships, and digital products. Slow to start but high long-term upside.',
    minHoursPerWeek: 10,
    firstIncome: 'longterm',
    budgetLevel: 2,
    relatedSkills: ['Marketing'],
    workStyles: ['Creative work', 'Working with people'],
    requires: ['Being on camera', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–50/mo', '1-3months': '€0–200/mo', '3-6months': '€100–1,000/mo', longterm: '€1,000–20,000/mo' },
  },
  {
    name: 'Podcast',
    emoji: '🎙️',
    description: 'Record audio episodes on a niche you know well and monetise through sponsorships, listener support, or a paid community. No camera needed.',
    minHoursPerWeek: 5,
    firstIncome: 'longterm',
    budgetLevel: 1,
    relatedSkills: ['Marketing'],
    workStyles: ['Creative work', 'Working with people'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0/mo', '1-3months': '€0–200/mo', '3-6months': '€100–1,000/mo', longterm: '€500–10,000/mo' },
  },
  {
    name: 'Newsletter',
    emoji: '📧',
    description: 'Write a regular email newsletter on a topic you know well and monetise via sponsorships, paid subscriptions, or affiliate links. Low cost, compounding returns.',
    minHoursPerWeek: 5,
    firstIncome: 'slow',
    budgetLevel: 0,
    relatedSkills: ['Writing', 'Marketing'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Writing lots of text', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–100/mo', '1-3months': '€0–500/mo', '3-6months': '€200–2,000/mo', longterm: '€1,000–10,000/mo' },
  },
  {
    name: 'Digital Products',
    emoji: '📦',
    description: 'Create and sell ebooks, templates, Notion dashboards, Lightroom presets, or mini-courses. Build once, sell forever with zero fulfilment cost.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Writing', 'Design', 'Coding'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–300/mo', '1-3months': '€100–1,000/mo', '3-6months': '€400–3,000/mo', longterm: '€1,500–10,000/mo' },
  },
  {
    name: 'Print on Demand',
    emoji: '👕',
    description: 'Design T-shirts, mugs, and prints that are only manufactured when a customer orders — no inventory, no upfront stock cost.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–200/mo', '1-3months': '€100–800/mo', '3-6months': '€300–2,000/mo', longterm: '€1,000–5,000/mo' },
  },
  {
    name: 'Etsy Shop',
    emoji: '🛍️',
    description: 'Sell handmade crafts, digital downloads, or vintage items on Etsy\'s marketplace. Built-in search traffic makes it easier to get found than a standalone store.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–300/mo', '1-3months': '€200–1,000/mo', '3-6months': '€500–3,000/mo', longterm: '€1,500–8,000/mo' },
  },
  {
    name: 'Dropshipping',
    emoji: '📬',
    description: 'Sell products online without holding any inventory — suppliers ship directly to your customers. Requires strong marketing and product research skills.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: ['Marketing'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks', 'Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€300–2,000/mo', '3-6months': '€800–5,000/mo', longterm: '€2,000–15,000/mo' },
  },
  {
    name: 'Amazon FBA',
    emoji: '📦',
    description: 'Source physical products and sell them through Amazon\'s warehouse and fulfilment network. High income potential but requires significant upfront capital.',
    minHoursPerWeek: 10,
    firstIncome: 'slow',
    budgetLevel: 3,
    relatedSkills: ['Marketing'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks', 'Technical work'],
    incomeByTimeline: { '30days': '€0/mo', '1-3months': '€0–500/mo', '3-6months': '€500–3,000/mo', longterm: '€2,000–20,000/mo' },
  },
  {
    name: 'Stock Photography',
    emoji: '🖼️',
    description: 'Upload your photos to sites like Shutterstock or Getty and earn royalties each time someone licenses them. Passive income that compounds over time.',
    minHoursPerWeek: 5,
    firstIncome: 'slow',
    budgetLevel: 2,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€0–50/mo', '1-3months': '€50–200/mo', '3-6months': '€100–600/mo', longterm: '€300–2,000/mo' },
  },
  {
    name: 'Photography',
    emoji: '📷',
    description: 'Offer professional photography for events, portraits, brands, and real estate. Requires a decent camera but the hourly rate is one of the best for local services.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 2,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€100–500/mo', '1-3months': '€400–1,500/mo', '3-6months': '€800–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Voiceover Work',
    emoji: '🎤',
    description: 'Record your voice for ads, audiobooks, explainer videos, and e-learning courses. A decent mic and a quiet room are all you need to get started.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–300/mo', '1-3months': '€200–800/mo', '3-6months': '€500–2,000/mo', longterm: '€1,500–6,000/mo' },
  },
  {
    name: 'Translation Services',
    emoji: '🌐',
    description: 'Translate documents, websites, and content between languages. If you\'re fluent in two or more languages, this is a clean, reliable freelance income stream.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Languages'],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks', 'Writing lots of text'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€800–2,500/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Local Arbitrage',
    emoji: '🔄',
    description: 'Buy underpriced items at garage sales, charity shops, or Facebook Marketplace and flip them for profit on eBay or Vinted. Hustle-heavy but fast cash.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 2,
    relatedSkills: [],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€200–800/mo', '1-3months': '€500–2,000/mo', '3-6months': '€800–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Vintage Reselling',
    emoji: '🏷️',
    description: 'Source vintage clothing and items from car boots and charity shops, then resell on Vinted, Depop, or eBay. Great for people who enjoy hunting for bargains.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€100–500/mo', '1-3months': '€300–1,000/mo', '3-6months': '€500–2,000/mo', longterm: '€1,000–5,000/mo' },
  },
  {
    name: 'Dog Walking',
    emoji: '🐕',
    description: 'Walk dogs for busy pet owners in your local area. One of the easiest ways to earn cash quickly with zero setup cost — just show up.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone', 'Working with people'],
    requires: [],
    incomeByTimeline: { '30days': '€200–500/mo', '1-3months': '€400–1,000/mo', '3-6months': '€600–1,500/mo', longterm: '€1,200–3,000/mo' },
  },
  {
    name: 'Cleaning Service',
    emoji: '🧹',
    description: 'Offer home or office cleaning to local clients. Recurring weekly bookings mean predictable income, and word-of-mouth growth is fast in local areas.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€600–1,500/mo', '3-6months': '€1,000–2,500/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Food Delivery',
    emoji: '🛵',
    description: 'Deliver food for platforms like Uber Eats or Deliveroo on your own schedule. Fastest possible start — you can earn your first money today.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€400–1,000/mo', '3-6months': '€500–1,200/mo', longterm: '€800–2,000/mo' },
  },
  {
    name: 'Handyman Services',
    emoji: '🔧',
    description: 'Offer small repairs, furniture assembly, and odd jobs to local homeowners. High hourly rates and consistent demand from people who can\'t or won\'t DIY.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 2,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Cold outreach'],
    incomeByTimeline: { '30days': '€300–1,000/mo', '1-3months': '€600–2,000/mo', '3-6months': '€1,000–3,000/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Gardening',
    emoji: '🌱',
    description: 'Mow lawns, plant borders, and maintain gardens for local homeowners. Seasonal but loyal clients — many will book you weekly throughout summer.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€600–1,800/mo', longterm: '€1,200–4,000/mo' },
  },
  {
    name: 'Personal Shopping',
    emoji: '🛒',
    description: 'Shop for groceries, gifts, or outfits for time-poor clients. Can be done locally or online, and loyal clients often refer friends quickly.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working with people', 'Working alone'],
    requires: ['Cold outreach'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€700–2,000/mo', longterm: '€1,500–5,000/mo' },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseHoursMin(h: string | null): number {
  if (!h) return 5
  if (h.startsWith('2')) return 2
  if (h.startsWith('5')) return 5
  if (h.startsWith('10')) return 10
  return 20
}

function parseBudgetLevel(b: string | null): 0 | 1 | 2 | 3 {
  if (!b) return 0
  if (b.startsWith('€0')) return 0
  if (b.startsWith('Under')) return 1
  if (b.startsWith('€100')) return 2
  return 3
}

function parseTimeline(t: string | null): 'Within 30 days' | '1-3 months' | '3-6 months' | 'Building long term' {
  if (!t) return '3-6 months'
  if (t.includes('30')) return 'Within 30 days'
  if (t.includes('1')) return '1-3 months'
  if (t.includes('3-6')) return '3-6 months'
  return 'Building long term'
}

function timelineScore(firstIncome: HustlePath['firstIncome'], userTimeline: string | null): number {
  const tl = parseTimeline(userTimeline)
  const matrix: Record<HustlePath['firstIncome'], Record<string, number>> = {
    fast:     { 'Within 30 days': 20, '1-3 months': 20, '3-6 months': 15, 'Building long term': 10 },
    medium:   { 'Within 30 days': 5,  '1-3 months': 20, '3-6 months': 18, 'Building long term': 12 },
    slow:     { 'Within 30 days': 0,  '1-3 months': 8,  '3-6 months': 20, 'Building long term': 18 },
    longterm: { 'Within 30 days': 0,  '1-3 months': 2,  '3-6 months': 10, 'Building long term': 20 },
  }
  return matrix[firstIncome][tl] ?? 0
}

function skillsScore(path: HustlePath, userSkills: string[]): number {
  if (path.relatedSkills.length === 0) return 15
  const hasNone = userSkills.length === 0 || userSkills.includes('None of these')
  if (hasNone) return 5
  const matches = path.relatedSkills.filter(s => userSkills.includes(s)).length
  if (matches === 0) return 7
  return Math.min(20, 10 + matches * 6)
}

function getIncomeRange(path: HustlePath, timeline: string | null): string {
  const tl = parseTimeline(timeline)
  if (tl === 'Within 30 days') return path.incomeByTimeline['30days']
  if (tl === '1-3 months') return path.incomeByTimeline['1-3months']
  if (tl === '3-6 months') return path.incomeByTimeline['3-6months']
  return path.incomeByTimeline['longterm']
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function generateExplanation(path: HustlePath, profile: UserProfile, lang = 'en'): string {
  const T = getExplain(lang)
  const userSkills = profile.skills ?? []
  const userHates = profile.hates ?? []
  const matchingSkills = path.relatedSkills.filter(s => userSkills.includes(s))
  const avoidedThings = path.requires.filter(r => userHates.includes(r))
  const noConflicts = avoidedThings.length === 0
  const userHours = parseHoursMin(profile.hours_available)
  const fitsHours = path.minHoursPerWeek <= userHours
  const zeroBudget = profile.budget?.startsWith('€0')
  const fastNeeded = profile.income_timeline === 'Within 30 days' || profile.income_timeline === '1-3 months'
  const isFast = path.firstIncome === 'fast'
  const prefMatch = profile.preferences && path.workStyles.includes(profile.preferences)
  const location = profile.location ?? ''
  const hasLocation = location.length > 2

  // Build a pool of true statements, pick 2 that are different from each other
  const pool: string[] = []

  // Skills angle
  if (matchingSkills.length >= 2) {
    pool.push(T.skills2(matchingSkills[0].toLowerCase(), matchingSkills[1].toLowerCase()))
  } else if (matchingSkills.length === 1) {
    pool.push(T.skills1(matchingSkills[0].toLowerCase()))
  } else if (path.relatedSkills.length === 0) {
    pool.push(T.skillsNone)
  } else {
    pool.push(T.skillsLearnable)
  }

  // Timeline angle
  if (isFast && fastNeeded) {
    pool.push(T.timelineFastNeeded)
  } else if (isFast && !fastNeeded) {
    pool.push(T.timelineFastAhead)
  } else if (path.firstIncome === 'medium' && fastNeeded) {
    pool.push(T.timelineMediumFast)
  } else {
    pool.push(T.timelineSlow)
  }

  // Budget angle
  if (path.budgetLevel === 0 && zeroBudget) {
    pool.push(T.budgetFreeZero)
  } else if (path.budgetLevel === 0 && !zeroBudget) {
    pool.push(T.budgetFreeHasBudget)
  } else if (path.budgetLevel === 1 && !zeroBudget) {
    pool.push(T.budgetLow)
  }

  // Hours angle
  if (fitsHours && profile.hours_available) {
    pool.push(T.hoursOk(profile.hours_available))
  }

  // Work style angle
  if (prefMatch && profile.preferences) {
    const styleMap: Record<string, string> = {
      'Creative work': T.styleCreative,
      'Analytical work': T.styleAnalytical,
      'Working with people': T.stylePeople,
      'Working alone': T.styleAlone,
    }
    pool.push(styleMap[profile.preferences] ?? T.styleCreative)
  }

  // Conflict avoidance angle
  if (noConflicts && path.requires.length > 0) {
    pool.push(T.noConflicts)
  }

  // Location angle (for paths that benefit from local context)
  if (hasLocation && (path.name.includes('Local') || path.name.includes('Tutoring') || path.name.includes('Coaching'))) {
    pool.push(T.location(location))
  }

  // "Tried before" angle
  if (profile.tried_before && profile.tried_before.length > 5) {
    if (profile.tried_before.toLowerCase().includes('dropshipping') || profile.tried_before.toLowerCase().includes('ecom')) {
      if (!path.name.toLowerCase().includes('drop') && !path.name.toLowerCase().includes('ecom')) {
        pool.push(T.triedBefore)
      }
    }
  }

  // Fallback
  if (pool.length === 0) {
    pool.push(T.fallback1)
    pool.push(T.fallback2)
  }

  // Pick first 2 that are distinct enough
  const first = pool[0]
  const second = pool.find((p, i) => i > 0 && p.slice(0, 20) !== first.slice(0, 20)) ?? pool[1] ?? pool[0]

  return `${cap(first)}. ${cap(second)}.`
}

// ─── Main scoring function ────────────────────────────────────────────────────

export function scorePaths(profile: UserProfile, lang = 'en'): ScoredPath[] {
  const userSkills = profile.skills ?? []
  const userHates = profile.hates ?? []
  const userHoursMin = parseHoursMin(profile.hours_available)
  const userBudgetLevel = parseBudgetLevel(profile.budget)

  return PATHS.map(path => {
    let score = 0

    // 1. Hours fit (20 pts)
    if (path.minHoursPerWeek <= userHoursMin) score += 20
    else if (path.minHoursPerWeek <= userHoursMin * 1.5) score += 10
    else score += 0

    // 2. Timeline fit (20 pts)
    score += timelineScore(path.firstIncome, profile.income_timeline)

    // 3. Budget fit (20 pts) — hard blocker if can't afford
    if (path.budgetLevel <= userBudgetLevel) score += 20
    else if (path.budgetLevel === userBudgetLevel + 1) score += 8
    else score += 0

    // 4. Skills overlap (20 pts)
    score += skillsScore(path, userSkills)

    // 5. Work style fit (10 pts)
    if (profile.preferences && path.workStyles.includes(profile.preferences)) score += 10
    else score += 4

    // 6. Avoidance fit (10 pts)
    const requiredHates = path.requires.filter(r => userHates.includes(r)).length
    score += Math.max(0, 10 - requiredHates * 5)

    const matchPercent = Math.min(99, Math.max(30, score))
    const explanation = generateExplanation(path, profile, lang)
    const incomeRange = getIncomeRange(path, profile.income_timeline)

    return { ...path, score, matchPercent, explanation, incomeRange }
  }).sort((a, b) => b.score - a.score)
}
