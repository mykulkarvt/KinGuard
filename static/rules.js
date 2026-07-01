// ---- KinGuard : साझा नियम और शब्द (बहुभाषी / multilingual) ----
// One place that defines every scam situation AND every bit of UI text, keyed
// by language. Senior, family and setup pages all read from here, so wording
// stays in sync. Adding a language = adding one entry to RULES and UI below
// (plus a LANG_TTS code and a LANGS list item) — no template changes needed.
//
// ⚠️ Translations should be reviewed by a native speaker before being relied
// on — these are safety messages for elders.

// HTML-escape anything that came from onboarding (names, phone numbers) before
// it is dropped into the page. Normal names and digits pass through unchanged.
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// Fill {placeholders} in a string from a map of values.
function fmt(s, vars){
  return String(s == null ? '' : s).replace(/\{(\w+)\}/g, (_, k) =>
    (vars && vars[k] != null) ? vars[k] : '');
}

// Per-scam content. Icons + GRID order are language-independent (see below).
const RULES = {
  hi: {
    police: {
      icon: '👮',
      label: 'पुलिस / CBI गिरफ़्तारी की धमकी दे रहे हैं',
      sub: '"डिजिटल अरेस्ट", वारंट, FIR',
      why: 'सच्ची पुलिस कभी फ़ोन या वीडियो कॉल पर गिरफ़्तार नहीं करती। "डिजिटल अरेस्ट" जैसी कोई चीज़ नहीं होती।',
      danger: 'यह "डिजिटल अरेस्ट" धोखे से मेल खाता है — भारत में सबसे ख़तरनाक में से एक। उन्होंने कुछ ग़लत नहीं किया है।',
      coach: ['शांत रहो। कहो कि यह धोखा है — वह कॉल तुरंत काट दें।',
              'सच्ची पुलिस फ़ोन या वीडियो कॉल पर गिरफ़्तार नहीं करती।',
              'पैसे भेजने या OTP/PIN/पासवर्ड देने से रोको।']
    },
    transfer: {
      icon: '💸',
      label: 'कोई "सेफ़ अकाउंट" में पैसे भेजने को कह रहा है',
      sub: '"जाँच के लिए, वापस मिल जाएँगे"',
      why: 'कोई भी असली अफ़सर पैसे "सेफ़ अकाउंट" में नहीं मँगवाता। एक बार भेजे तो पैसे वापस नहीं आते।',
      danger: 'कोई असली अफ़सर "सेफ़ अकाउंट" में पैसे नहीं मँगवाता। यह धोखा है।',
      coach: ['कहो — अभी रुको, पैसे मत भेजो।',
              'एक बार भेजे पैसे वापस नहीं आते।',
              'किसी को OTP या PIN मत देने दो।']
    },
    voice: {
      icon: '🆘',
      label: 'घरवाले की आवाज़ तुरंत पैसे माँग रही है',
      sub: 'एक्सीडेंट, गिरफ़्तारी, "किसी को मत बताना"',
      why: 'कंप्यूटर किसी की भी आवाज़ की नकल कर सकता है। फ़ोन रखो और परिवार को उनके अपने नंबर पर ख़ुद फ़ोन करो।',
      danger: 'कंप्यूटर किसी की भी आवाज़ की नकल कर सकता है (वॉइस क्लोन)। आवाज़ का असली लगना कुछ साबित नहीं करता।',
      coach: ['उस व्यक्ति को उनके अपने नंबर पर ख़ुद फ़ोन करके पुष्टि करो।',
              'आवाज़ असली लगे तो भी भरोसा मत करो।',
              'पैसे भेजने से पहले हमेशा रुको।']
    },
    link: {
      icon: '🔗',
      label: 'मैसेज में लिंक — KYC / खाता बंद / रिफंड',
      sub: '"अभी क्लिक करो वरना खाता बंद"',
      why: 'बैंक कभी मैसेज के लिंक से खाता ठीक करने को नहीं कहता। लिंक मत खोलो। OTP या PIN किसी को मत दो।',
      danger: 'यह फ़िशिंग लिंक है — असली जैसी दिखने वाली नक़ली बैंक वेबसाइट।',
      coach: ['उन्हें लिंक मत खोलने दो।',
              'OTP, PIN या कार्ड नंबर किसी को नहीं।',
              'बैंक का ऐप ख़ुद खोलकर जाँचो।']
    },
    prize: {
      icon: '🎁',
      label: 'इनाम / लॉटरी / पैसा दोगुना करने का वादा',
      sub: '"पहले थोड़ी फ़ीस भेजो"',
      why: 'जो सच होने के लिए बहुत अच्छा लगे, वह झूठ है। इनाम पाने के लिए कभी पैसे नहीं देने पड़ते।',
      danger: 'यह झाँसा है — कोई असली इनाम पाने के लिए पहले पैसे नहीं माँगता।',
      coach: ['कहो — कोई फ़ीस मत भरो।',
              'जो बहुत अच्छा लगे, वह झूठ है।',
              'निवेश से पहले परिवार से पूछो।']
    },
    panic: {
      icon: '🆘',
      label: 'HELP दबाया — "मुझे डर लग रहा है"',
      sub: '',
      why: '',
      danger: 'उन्होंने डर के मारे मदद माँगी है। तुरंत फ़ोन करो।',
      coach: ['शांति से पूछो क्या हुआ — किसने, क्या कहा।',
              'कोई भी पैसे की माँग हो तो वह धोखा है।',
              'कुछ भी भेजने या बताने से पहले रोको।']
    }
  },

  te: {
    police: {
      icon: '👮',
      label: 'పోలీస్ / CBI అరెస్ట్ చేస్తామని బెదిరిస్తున్నారు',
      sub: '"డిజిటల్ అరెస్ట్", వారెంట్, FIR',
      why: 'నిజమైన పోలీసులు ఎప్పుడూ ఫోన్ లేదా వీడియో కాల్‌లో అరెస్ట్ చేయరు. "డిజిటల్ అరెస్ట్" అనేదే లేదు.',
      danger: 'ఇది "డిజిటల్ అరెస్ట్" మోసంతో సరిపోతుంది — భారత్‌లో అత్యంత ప్రమాదకరమైన వాటిలో ఒకటి. వారు ఏ తప్పూ చేయలేదు.',
      coach: ['ప్రశాంతంగా ఉండండి. ఇది మోసం అని చెప్పండి — ఆ కాల్ వెంటనే కట్ చేయించండి.',
              'నిజమైన పోలీసులు ఫోన్ లేదా వీడియో కాల్‌లో అరెస్ట్ చేయరు.',
              'డబ్బు పంపడం లేదా OTP/PIN/పాస్‌వర్డ్ ఇవ్వడం ఆపండి.']
    },
    transfer: {
      icon: '💸',
      label: 'ఎవరో "సేఫ్ అకౌంట్"కు డబ్బు పంపమని అడుగుతున్నారు',
      sub: '"విచారణ కోసం, తిరిగి వస్తాయి"',
      why: 'నిజమైన అధికారి ఎవరూ "సేఫ్ అకౌంట్"కు డబ్బు అడగరు. ఒకసారి పంపితే డబ్బు తిరిగి రాదు.',
      danger: 'నిజమైన అధికారి ఎవరూ "సేఫ్ అకౌంట్"కు డబ్బు అడగరు. ఇది మోసం.',
      coach: ['చెప్పండి — ఇప్పుడే ఆగండి, డబ్బు పంపకండి.',
              'ఒకసారి పంపిన డబ్బు తిరిగి రాదు.',
              'ఎవరికీ OTP లేదా PIN ఇవ్వనివ్వకండి.']
    },
    voice: {
      icon: '🆘',
      label: 'కుటుంబ సభ్యుని గొంతు వెంటనే డబ్బు అడుగుతోంది',
      sub: 'యాక్సిడెంట్, అరెస్ట్, "ఎవరికీ చెప్పవద్దు"',
      why: 'కంప్యూటర్ ఎవరి గొంతునైనా నకలు చేయగలదు. ఫోన్ పెట్టేయండి, కుటుంబ సభ్యునికి వారి సొంత నంబర్‌కు మీరే ఫోన్ చేయండి.',
      danger: 'కంప్యూటర్ ఎవరి గొంతునైనా నకలు చేయగలదు (వాయిస్ క్లోన్). గొంతు నిజంగా అనిపించడం దేన్నీ రుజువు చేయదు.',
      coach: ['ఆ వ్యక్తికి వారి సొంత నంబర్‌కు మీరే ఫోన్ చేసి నిర్ధారించుకోండి.',
              'గొంతు నిజమని అనిపించినా నమ్మకండి.',
              'డబ్బు పంపే ముందు ఎప్పుడూ ఆగండి.']
    },
    link: {
      icon: '🔗',
      label: 'మెసేజ్‌లో లింక్ — KYC / ఖాతా మూసివేత / రీఫండ్',
      sub: '"ఇప్పుడే క్లిక్ చేయండి లేకపోతే ఖాతా మూసివేత"',
      why: 'బ్యాంక్ ఎప్పుడూ మెసేజ్ లింక్‌తో ఖాతా సరిచేయమని అడగదు. లింక్ తెరవకండి. OTP లేదా PIN ఎవరికీ ఇవ్వకండి.',
      danger: 'ఇది ఫిషింగ్ లింక్ — నిజమైనట్టు కనిపించే నకిలీ బ్యాంక్ వెబ్‌సైట్.',
      coach: ['లింక్ తెరవనివ్వకండి.',
              'OTP, PIN లేదా కార్డ్ నంబర్ ఎవరికీ వద్దు.',
              'బ్యాంక్ యాప్ మీరే తెరిచి చూడండి.']
    },
    prize: {
      icon: '🎁',
      label: 'బహుమతి / లాటరీ / డబ్బు రెట్టింపు చేస్తామనే వాగ్దానం',
      sub: '"ముందు కొంత ఫీజు పంపండి"',
      why: 'నిజం కావడానికి మరీ బాగుందనిపిస్తే, అది అబద్ధం. బహుమతి పొందడానికి ఎప్పుడూ డబ్బు కట్టాల్సిన అవసరం లేదు.',
      danger: 'ఇది మోసం — నిజమైన బహుమతి కోసం ఎవరూ ముందు డబ్బు అడగరు.',
      coach: ['చెప్పండి — ఏ ఫీజూ కట్టకండి.',
              'మరీ బాగుందనిపించేది అబద్ధం.',
              'పెట్టుబడి ముందు కుటుంబాన్ని అడగండి.']
    },
    panic: {
      icon: '🆘',
      label: 'HELP నొక్కారు — "నాకు భయంగా ఉంది"',
      sub: '',
      why: '',
      danger: 'వారు భయంతో సహాయం అడిగారు. వెంటనే ఫోన్ చేయండి.',
      coach: ['ప్రశాంతంగా అడగండి ఏం జరిగింది — ఎవరు, ఏం చెప్పారు.',
              'ఏదైనా డబ్బు అడిగితే అది మోసమే.',
              'ఏదైనా పంపే లేదా చెప్పే ముందు ఆపండి.']
    }
  },

  en: {
    police: {
      icon: '👮',
      label: 'Police / CBI are threatening to arrest you',
      sub: '"Digital arrest", warrant, FIR',
      why: 'Real police never arrest you over a phone or video call. There is no such thing as a "digital arrest".',
      danger: 'This matches the "digital arrest" scam — one of the most dangerous in India. They have done nothing wrong.',
      coach: ['Stay calm. Tell them it is a scam — have them cut the call right away.',
              'Real police do not arrest anyone over a phone or video call.',
              'Stop them from sending money or giving an OTP/PIN/password.']
    },
    transfer: {
      icon: '💸',
      label: 'Someone is asking to send money to a "safe account"',
      sub: '"For verification, you will get it back"',
      why: 'No real officer ever asks for money in a "safe account". Once sent, the money does not come back.',
      danger: 'No real officer asks for money in a "safe account". This is a scam.',
      coach: ['Say — stop now, do not send money.',
              'Money once sent does not come back.',
              'Do not let anyone get an OTP or PIN.']
    },
    voice: {
      icon: '🆘',
      label: 'Someone who sounds like family is urgently asking for money',
      sub: 'Accident, arrest, "do not tell anyone"',
      why: 'A computer can copy any voice. Hang up and call your family member yourself on their own number.',
      danger: 'A computer can copy any voice (voice clone). The voice sounding real proves nothing.',
      coach: ['Call that person yourself on their own number to confirm.',
              'Even if the voice sounds real, do not trust it.',
              'Always stop before sending money.']
    },
    link: {
      icon: '🔗',
      label: 'A link in a message — KYC / account blocked / refund',
      sub: '"Click now or your account will be blocked"',
      why: 'A bank never asks you to fix your account through a message link. Do not open the link. Do not give an OTP or PIN to anyone.',
      danger: 'This is a phishing link — a fake bank website made to look real.',
      coach: ['Do not let them open the link.',
              'No OTP, PIN or card number to anyone.',
              'Open the bank app yourself and check.']
    },
    prize: {
      icon: '🎁',
      label: 'Prize / lottery / promise to double your money',
      sub: '"First send a small fee"',
      why: 'If it sounds too good to be true, it is false. You never have to pay money to receive a prize.',
      danger: 'This is a trap — no real prize asks for money first.',
      coach: ['Say — do not pay any fee.',
              'Anything that sounds too good is false.',
              'Ask your family before investing.']
    },
    panic: {
      icon: '🆘',
      label: 'Pressed HELP — "I am scared"',
      sub: '',
      why: '',
      danger: 'They have asked for help out of fear. Call right away.',
      coach: ['Calmly ask what happened — who, and what they said.',
              'Any demand for money is a scam.',
              'Stop them before they send or tell anything.']
    }
  }
};

// All non-rule UI text ("chrome"), keyed by language. {fam}/{senior} are filled
// in at render time with the configured names.
const UI = {
  hi: {
    possPhone: ' का फ़ोन',
    tagline: 'परिवार की सुरक्षा',
    famTag: 'परिवार',
    setupTag: 'सेटअप · Setup',
    footSenior: 'नमूना — बुज़ुर्ग का फ़ोन।',
    footFamily: 'नमूना — परिजन का फ़ोन।',
    setupFoot: 'यह सेटअप परिवार का कोई सदस्य एक बार करता है। (Family does this once.)',
    change: '↻ बदलें',
    // senior
    panicT1: 'मुझे डर लग रहा है',
    panicT2: 'मेरे परिवार को अभी बुलाओ',
    panicAria: 'मुझे डर लग रहा है, मेरे परिवार को बुलाओ',
    orChoose: 'या नीचे से चुनो',
    whatHappening: 'क्या हो रहा है?',
    safeTitle: 'रुको। तुम सुरक्षित हो।',
    fraudTitle: 'यह धोखा है।',
    notifySending: '{fam} को सूचना भेजी जा रही है…',
    notifyFailed: 'सूचना नहीं भेजी जा सकी',
    notifyOk: '{fam} को सूचना भेज दी — वे फ़ोन कर रहे हैं',
    callFam: '{fam} को फ़ोन करो',
    hangup: 'फ़ोन रखो',
    noMoney: 'पैसे मत भेजो',
    resend: '↻  सूचना दुबारा भेजो',
    listen: '▶  सुनो',
    speaking: 'बोल रहा है…',
    back: '⟵  वापस',
    help1930: 'मदद: 1930 दबाओ',
    speakPanic: 'रुको। तुम सुरक्षित हो। {fam} को सूचना भेज दी है। फ़ोन रखो। पैसे मत भेजो।',
    scamTail: 'फ़ोन रखो। पैसे मत भेजो।',
    // family
    calmNoAlert: '✅ कोई सूचना नहीं — सब ठीक है।',
    seniorSafe: '{senior} सुरक्षित हैं।',
    pressHint: '{senior} के फ़ोन पर कोई बटन दबाएँ — सूचना यहाँ अपने-आप आएगी।',
    today: 'आज',
    important: '🛡️ ज़रूरी',
    now: 'अभी',
    maybeScam: '{senior} अभी धोखे में हो सकती हैं',
    tapToOpen: 'खोलने के लिए दबाएँ  ›',
    pressedHelp: 'HELP दबाया',
    theyReported: 'उन्होंने बताया',
    callSeniorNow: '{senior} को अभी फ़ोन करो',
    whatToSay: '💬 उन्हें क्या कहना है',
    report1930: '1930 पर रिपोर्ट करो',
    resolve: '✓  वे सुरक्षित हैं — मैंने सँभाल लिया',
    resolvedTitle: 'सुरक्षित दर्ज किया',
    resolvedWhy: 'दर्ज कर लिया। अगर {senior} को फिर निशाना बनाया गया, तो आपको इसी तरह सूचना मिलेगी।',
    report: 'रिपोर्ट',
    time: 'समय',
    result: 'नतीजा',
    noMoneySent: 'कोई पैसा नहीं भेजा ✓',
    done: 'हो गया  ⟳',
    enableAlerts: '🔔 बंद होने पर भी सूचना पाएँ',
    alertsOn: '🔔 सूचनाएँ चालू हैं',
    alertsBlocked: 'सूचना की अनुमति नहीं मिली — फ़ोन की सेटिंग में अनुमति दें।',
    alertsFail: 'सूचनाएँ चालू नहीं हो सकीं।',
    // setup
    whichPhone: 'कौन-सा फ़ोन किसका?',
    seniorNameLbl: 'बुज़ुर्ग का नाम',
    seniorNamePh: 'जैसे: कमला',
    seniorPhoneLbl: 'बुज़ुर्ग का फ़ोन नंबर',
    seniorPhonePh: 'परिवार इस नंबर पर फ़ोन करेगा',
    familyNameLbl: 'भरोसेमंद परिजन का नाम',
    familyNamePh: 'जैसे: अर्जुन',
    familyPhoneLbl: 'परिजन का फ़ोन नंबर',
    familyPhonePh: 'बुज़ुर्ग इस नंबर पर फ़ोन करेंगे',
    langDivider: 'भाषा · Language',
    needsDivider: 'बुज़ुर्ग की ज़रूरतें',
    needsHelp: 'जो लागू हो चुनें — फ़ोन अपने-आप उसी तरह खुलेगा।',
    save: 'सहेजें · Save',
    setupDone: 'सेटअप हो गया!',
    openPhones: 'अब फ़ोन खोलें:',
    saveError: 'सेव नहीं हुआ — सर्वर चालू है?',
    openMyScreen: 'मेरी स्क्रीन खोलें',
    sendSeniorLink: 'यह लिंक बुज़ुर्ग के फ़ोन पर भेजें:',
    condHearingT: 'सुनने में कठिनाई',   condHearingS: 'सूचना पर फ़ोन कंपन करेगा',
    condVisionT: 'देखने में कठिनाई',    condVisionS: 'बड़ा टेक्स्ट, ज़्यादा कंट्रास्ट, अपने-आप पढ़कर सुनाना',
    condTremorT: 'हाथ काँपना / कमज़ोर पकड़', condTremorS: 'और बड़े बटन',
    condMemoryT: 'याददाश्त / भ्रम',     condMemoryS: 'सरल मोड — सिर्फ़ एक बड़ा बटन'
  },

  te: {
    possPhone: ' ఫోన్',
    tagline: 'కుటుంబ భద్రత',
    famTag: 'కుటుంబం',
    setupTag: 'సెటప్ · Setup',
    footSenior: 'నమూనా — పెద్దవారి ఫోన్.',
    footFamily: 'నమూనా — కుటుంబ సభ్యుని ఫోన్.',
    setupFoot: 'ఈ సెటప్ కుటుంబంలో ఒకరు ఒకసారి చేస్తారు. (Family does this once.)',
    change: '↻ మార్చండి',
    // senior
    panicT1: 'నాకు భయంగా ఉంది',
    panicT2: 'నా కుటుంబాన్ని ఇప్పుడే పిలవండి',
    panicAria: 'నాకు భయంగా ఉంది, నా కుటుంబాన్ని పిలవండి',
    orChoose: 'లేదా కింద నుండి ఎంచుకోండి',
    whatHappening: 'ఏం జరుగుతోంది?',
    safeTitle: 'ఆగండి. మీరు సురక్షితం.',
    fraudTitle: 'ఇది మోసం.',
    notifySending: '{fam}కు సూచన పంపుతోంది…',
    notifyFailed: 'సూచన పంపలేకపోయాం',
    notifyOk: '{fam}కు సూచన పంపాం — వారు ఫోన్ చేస్తున్నారు',
    callFam: '{fam}కు ఫోన్ చేయండి',
    hangup: 'ఫోన్ పెట్టేయండి',
    noMoney: 'డబ్బు పంపకండి',
    resend: '↻  సూచన మళ్ళీ పంపండి',
    listen: '▶  వినండి',
    speaking: 'చదువుతోంది…',
    back: '⟵  వెనక్కి',
    help1930: 'సహాయం: 1930 నొక్కండి',
    speakPanic: 'ఆగండి. మీరు సురక్షితం. {fam}కు సూచన పంపాం. ఫోన్ పెట్టేయండి. డబ్బు పంపకండి.',
    scamTail: 'ఫోన్ పెట్టేయండి. డబ్బు పంపకండి.',
    // family
    calmNoAlert: '✅ ఎలాంటి సూచన లేదు — అంతా బాగుంది.',
    seniorSafe: '{senior} సురక్షితంగా ఉన్నారు.',
    pressHint: '{senior} ఫోన్‌లో ఏదైనా బటన్ నొక్కితే — సూచన ఇక్కడ దానంతట అదే వస్తుంది.',
    today: 'ఈరోజు',
    important: '🛡️ ముఖ్యం',
    now: 'ఇప్పుడే',
    maybeScam: '{senior} ఇప్పుడు మోసంలో ఉండవచ్చు',
    tapToOpen: 'తెరవడానికి నొక్కండి  ›',
    pressedHelp: 'HELP నొక్కారు',
    theyReported: 'వారు చెప్పింది',
    callSeniorNow: '{senior}కు ఇప్పుడే ఫోన్ చేయండి',
    whatToSay: '💬 వారికి ఏం చెప్పాలి',
    report1930: '1930కు రిపోర్ట్ చేయండి',
    resolve: '✓  వారు సురక్షితం — నేను చూసుకున్నాను',
    resolvedTitle: 'సురక్షితంగా నమోదు చేశాం',
    resolvedWhy: 'నమోదు చేశాం. {senior}ను మళ్ళీ లక్ష్యంగా చేస్తే, మీకు ఇలాగే సూచన వస్తుంది.',
    report: 'రిపోర్ట్',
    time: 'సమయం',
    result: 'ఫలితం',
    noMoneySent: 'డబ్బు ఏదీ పంపలేదు ✓',
    done: 'అయింది  ⟳',
    enableAlerts: '🔔 మూసి ఉన్నా సూచన పొందండి',
    alertsOn: '🔔 సూచనలు ఆన్‌లో ఉన్నాయి',
    alertsBlocked: 'సూచన అనుమతి లేదు — ఫోన్ సెట్టింగ్‌లో అనుమతి ఇవ్వండి.',
    alertsFail: 'సూచనలు ఆన్ కాలేకపోయాయి.',
    // setup
    whichPhone: 'ఏ ఫోన్ ఎవరిది?',
    seniorNameLbl: 'పెద్దవారి పేరు',
    seniorNamePh: 'ఉదా: కమల',
    seniorPhoneLbl: 'పెద్దవారి ఫోన్ నంబర్',
    seniorPhonePh: 'కుటుంబం ఈ నంబర్‌కు ఫోన్ చేస్తుంది',
    familyNameLbl: 'నమ్మకమైన కుటుంబ సభ్యుని పేరు',
    familyNamePh: 'ఉదా: అర్జున్',
    familyPhoneLbl: 'కుటుంబ సభ్యుని ఫోన్ నంబర్',
    familyPhonePh: 'పెద్దవారు ఈ నంబర్‌కు ఫోన్ చేస్తారు',
    langDivider: 'భాష · Language',
    needsDivider: 'పెద్దవారి అవసరాలు',
    needsHelp: 'వర్తించేవి ఎంచుకోండి — ఫోన్ దానంతట అలాగే తెరుచుకుంటుంది.',
    save: 'సేవ్ చేయండి · Save',
    setupDone: 'సెటప్ పూర్తయింది!',
    openPhones: 'ఇప్పుడు ఫోన్ తెరవండి:',
    saveError: 'సేవ్ కాలేదు — సర్వర్ నడుస్తోందా?',
    openMyScreen: 'నా స్క్రీన్ తెరవండి',
    sendSeniorLink: 'ఈ లింక్‌ను పెద్దవారి ఫోన్‌కు పంపండి:',
    condHearingT: 'వినికిడి కష్టం',     condHearingS: 'సూచన వచ్చినప్పుడు ఫోన్ కంపిస్తుంది',
    condVisionT: 'చూపు కష్టం',          condVisionS: 'పెద్ద టెక్స్ట్, ఎక్కువ కాంట్రాస్ట్, దానంతట చదివి వినిపించడం',
    condTremorT: 'చేతి వణుకు / బలహీన పట్టు', condTremorS: 'ఇంకా పెద్ద బటన్లు',
    condMemoryT: 'జ్ఞాపకశక్తి / గందరగోళం', condMemoryS: 'సరళ మోడ్ — ఒకే ఒక పెద్ద బటన్'
  },

  en: {
    possPhone: '’s phone',
    tagline: 'Family safety',
    famTag: 'Family',
    setupTag: 'Setup',
    footSenior: 'Sample — the elder’s phone.',
    footFamily: 'Sample — the family member’s phone.',
    setupFoot: 'A family member does this setup once.',
    change: '↻ Change',
    // senior
    panicT1: 'I am scared',
    panicT2: 'Call my family now',
    panicAria: 'I am scared, call my family',
    orChoose: 'or choose below',
    whatHappening: 'What is happening?',
    safeTitle: 'Stop. You are safe.',
    fraudTitle: 'This is a scam.',
    notifySending: 'Sending alert to {fam}…',
    notifyFailed: 'Could not send the alert',
    notifyOk: 'Alert sent to {fam} — they are calling',
    callFam: 'Call {fam}',
    hangup: 'Hang up',
    noMoney: 'Do not send money',
    resend: '↻  Send alert again',
    listen: '▶  Listen',
    speaking: 'Speaking…',
    back: '⟵  Back',
    help1930: 'Help: dial 1930',
    speakPanic: 'Stop. You are safe. The alert has been sent to {fam}. Hang up. Do not send money.',
    scamTail: 'Hang up. Do not send money.',
    // family
    calmNoAlert: '✅ No alerts — all is well.',
    seniorSafe: '{senior} is safe.',
    pressHint: 'When {senior} presses a button on their phone, the alert appears here automatically.',
    today: 'Today',
    important: '🛡️ Important',
    now: 'Now',
    maybeScam: '{senior} may be in a scam right now',
    tapToOpen: 'Press to open  ›',
    pressedHelp: 'Pressed HELP',
    theyReported: 'They reported',
    callSeniorNow: 'Call {senior} now',
    whatToSay: '💬 What to say to them',
    report1930: 'Report to 1930',
    resolve: '✓  They are safe — I have handled it',
    resolvedTitle: 'Marked safe',
    resolvedWhy: 'Recorded. If {senior} is targeted again, you will be alerted the same way.',
    report: 'Report',
    time: 'Time',
    result: 'Result',
    noMoneySent: 'No money sent ✓',
    done: 'Done  ⟳',
    enableAlerts: '🔔 Get alerts even when closed',
    alertsOn: '🔔 Alerts are on',
    alertsBlocked: 'Notification permission denied — allow it in your phone settings.',
    alertsFail: 'Could not turn on alerts.',
    // setup
    whichPhone: 'Which phone is whose?',
    seniorNameLbl: 'Elder’s name',
    seniorNamePh: 'e.g. Kamala',
    seniorPhoneLbl: 'Elder’s phone number',
    seniorPhonePh: 'Family will call this number',
    familyNameLbl: 'Trusted family member’s name',
    familyNamePh: 'e.g. Arjun',
    familyPhoneLbl: 'Family member’s phone number',
    familyPhonePh: 'The elder will call this number',
    langDivider: 'Language · भाषा',
    needsDivider: 'Elder’s needs',
    needsHelp: 'Select what applies — the phone will open that way automatically.',
    save: 'Save',
    setupDone: 'Setup complete!',
    openPhones: 'Now open the phone:',
    saveError: 'Not saved — is the server running?',
    openMyScreen: 'Open my screen',
    sendSeniorLink: "Send this link to the senior's phone:",
    condHearingT: 'Hard of hearing',  condHearingS: 'Phone vibrates on an alert',
    condVisionT: 'Trouble seeing',     condVisionS: 'Large text, high contrast, reads aloud automatically',
    condTremorT: 'Shaky hands / weak grip', condTremorS: 'Even bigger buttons',
    condMemoryT: 'Memory / confusion', condMemoryS: 'Simple mode — just one big button'
  }
};

// Order shown on the senior's situation grid (panic is the separate red button).
const GRID = ['police', 'transfer', 'voice', 'link', 'prize'];

// Languages offered in setup (display name is shown in its own script).
const LANGS = [
  { id: 'hi', name: 'हिन्दी' },
  { id: 'te', name: 'తెలుగు' },
  { id: 'en', name: 'English' }
];

// Map a language to a Web Speech API (BCP-47) voice code for auto-speak.
// Note: a device may not have a voice installed for every language; if so,
// speech silently does nothing while the visual guidance still works.
const LANG_TTS = { hi: 'hi-IN', te: 'te-IN', en: 'en-IN' };

// Resolve a possibly-unknown language to one we actually have, falling back to
// English. Use everywhere a cfg.lang is read.
function langOf(cfg){
  const l = cfg && cfg.lang;
  return (l && UI[l] && RULES[l]) ? l : 'en';
}

// names — defaults until onboarding overwrites them
const SENIOR_NAME = 'कमला';
const FAMILY_NAME = 'अर्जुन';
