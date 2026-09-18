// ---- KinGuard : साझा नियम और शब्द (बहुभाषी / multilingual) ----
// One place that defines every scam situation AND every bit of UI text, keyed
// by language. Senior, family and setup pages all read from here, so wording
// stays in sync. Adding a language = adding one entry to RULES_IN and UI
// below (plus a LANG_NAMES entry and a tts code in each COUNTRIES entry that
// offers it), no template changes needed.
//
// ⚠️ Translations should be reviewed by a native speaker before being relied
// on, these are safety messages for elders.

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

// Per-scam content. Icons + grid order are language-independent (see below).
const RULES_IN = {
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

  kn: {
    police: {
      icon: '👮',
      label: 'ಪೊಲೀಸ್ / CBI ಬಂಧಿಸುವುದಾಗಿ ಬೆದರಿಸುತ್ತಿದ್ದಾರೆ',
      sub: '"ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್", ವಾರಂಟ್, FIR',
      why: 'ನಿಜವಾದ ಪೊಲೀಸರು ಎಂದಿಗೂ ಫೋನ್ ಅಥವಾ ವಿಡಿಯೋ ಕರೆಯಲ್ಲಿ ಬಂಧಿಸುವುದಿಲ್ಲ. "ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್" ಎಂಬುದೇ ಇಲ್ಲ.',
      danger: 'ಇದು "ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್" ವಂಚನೆಗೆ ಹೊಂದುತ್ತದೆ — ಭಾರತದ ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ವಂಚನೆಗಳಲ್ಲಿ ಒಂದು. ಅವರು ಯಾವ ತಪ್ಪೂ ಮಾಡಿಲ್ಲ.',
      coach: ['ಶಾಂತವಾಗಿರಿ. ಇದು ವಂಚನೆ ಎಂದು ಹೇಳಿ — ಆ ಕರೆಯನ್ನು ತಕ್ಷಣ ಕಡಿತಗೊಳಿಸಲು ಹೇಳಿ.',
              'ನಿಜವಾದ ಪೊಲೀಸರು ಫೋನ್ ಅಥವಾ ವಿಡಿಯೋ ಕರೆಯಲ್ಲಿ ಯಾರನ್ನೂ ಬಂಧಿಸುವುದಿಲ್ಲ.',
              'ಹಣ ಕಳುಹಿಸುವುದನ್ನು ಅಥವಾ OTP/PIN/ಪಾಸ್‌ವರ್ಡ್ ಕೊಡುವುದನ್ನು ತಡೆಯಿರಿ.']
    },
    transfer: {
      icon: '💸',
      label: 'ಯಾರೋ "ಸೇಫ್ ಅಕೌಂಟ್"ಗೆ ಹಣ ಕಳುಹಿಸಲು ಕೇಳುತ್ತಿದ್ದಾರೆ',
      sub: '"ಪರಿಶೀಲನೆಗಾಗಿ, ವಾಪಸ್ ಸಿಗುತ್ತದೆ"',
      why: 'ನಿಜವಾದ ಯಾವ ಅಧಿಕಾರಿಯೂ "ಸೇಫ್ ಅಕೌಂಟ್"ಗೆ ಹಣ ಕೇಳುವುದಿಲ್ಲ. ಒಮ್ಮೆ ಕಳುಹಿಸಿದರೆ ಹಣ ವಾಪಸ್ ಬರುವುದಿಲ್ಲ.',
      danger: 'ನಿಜವಾದ ಯಾವ ಅಧಿಕಾರಿಯೂ "ಸೇಫ್ ಅಕೌಂಟ್"ಗೆ ಹಣ ಕೇಳುವುದಿಲ್ಲ. ಇದು ವಂಚನೆ.',
      coach: ['ಹೇಳಿ — ಈಗಲೇ ನಿಲ್ಲಿಸಿ, ಹಣ ಕಳುಹಿಸಬೇಡಿ.',
              'ಒಮ್ಮೆ ಕಳುಹಿಸಿದ ಹಣ ವಾಪಸ್ ಬರುವುದಿಲ್ಲ.',
              'ಯಾರಿಗೂ OTP ಅಥವಾ PIN ಸಿಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.']
    },
    voice: {
      icon: '🆘',
      label: 'ಮನೆಯವರ ಧ್ವನಿಯಂತೆ ಕೇಳುವವರು ತುರ್ತಾಗಿ ಹಣ ಕೇಳುತ್ತಿದ್ದಾರೆ',
      sub: 'ಅಪಘಾತ, ಬಂಧನ, "ಯಾರಿಗೂ ಹೇಳಬೇಡಿ"',
      why: 'ಕಂಪ್ಯೂಟರ್ ಯಾರ ಧ್ವನಿಯನ್ನಾದರೂ ನಕಲು ಮಾಡಬಲ್ಲದು. ಫೋನ್ ಇಟ್ಟುಬಿಡಿ, ಮನೆಯವರಿಗೆ ಅವರ ಸ್ವಂತ ನಂಬರಿಗೆ ನೀವೇ ಕರೆ ಮಾಡಿ.',
      danger: 'ಕಂಪ್ಯೂಟರ್ ಯಾರ ಧ್ವನಿಯನ್ನಾದರೂ ನಕಲು ಮಾಡಬಲ್ಲದು (ವಾಯ್ಸ್ ಕ್ಲೋನ್). ಧ್ವನಿ ನಿಜವೆನಿಸುವುದು ಏನನ್ನೂ ಸಾಬೀತುಪಡಿಸುವುದಿಲ್ಲ.',
      coach: ['ಆ ವ್ಯಕ್ತಿಗೆ ಅವರ ಸ್ವಂತ ನಂಬರಿಗೆ ನೀವೇ ಕರೆ ಮಾಡಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
              'ಧ್ವನಿ ನಿಜವೆನಿಸಿದರೂ ನಂಬಬೇಡಿ.',
              'ಹಣ ಕಳುಹಿಸುವ ಮೊದಲು ಯಾವಾಗಲೂ ನಿಲ್ಲಿ.']
    },
    link: {
      icon: '🔗',
      label: 'ಸಂದೇಶದಲ್ಲಿ ಲಿಂಕ್ — KYC / ಖಾತೆ ಬ್ಲಾಕ್ / ರೀಫಂಡ್',
      sub: '"ಈಗಲೇ ಕ್ಲಿಕ್ ಮಾಡಿ ಇಲ್ಲದಿದ್ದರೆ ಖಾತೆ ಬ್ಲಾಕ್"',
      why: 'ಬ್ಯಾಂಕ್ ಎಂದಿಗೂ ಸಂದೇಶದ ಲಿಂಕ್ ಮೂಲಕ ಖಾತೆ ಸರಿಪಡಿಸಲು ಕೇಳುವುದಿಲ್ಲ. ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ. OTP ಅಥವಾ PIN ಯಾರಿಗೂ ಕೊಡಬೇಡಿ.',
      danger: 'ಇದು ಫಿಶಿಂಗ್ ಲಿಂಕ್ — ನಿಜವೆಂಬಂತೆ ಕಾಣುವ ನಕಲಿ ಬ್ಯಾಂಕ್ ವೆಬ್‌ಸೈಟ್.',
      coach: ['ಅವರು ಲಿಂಕ್ ತೆರೆಯದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
              'OTP, PIN ಅಥವಾ ಕಾರ್ಡ್ ನಂಬರ್ ಯಾರಿಗೂ ಬೇಡ.',
              'ಬ್ಯಾಂಕ್ ಅಪ್ಲಿಕೇಶನ್ ನೀವೇ ತೆರೆದು ಪರಿಶೀಲಿಸಿ.']
    },
    prize: {
      icon: '🎁',
      label: 'ಬಹುಮಾನ / ಲಾಟರಿ / ಹಣ ದುಪ್ಪಟ್ಟು ಮಾಡುವ ಭರವಸೆ',
      sub: '"ಮೊದಲು ಸ್ವಲ್ಪ ಶುಲ್ಕ ಕಳುಹಿಸಿ"',
      why: 'ನಿಜವಾಗಲು ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ ಎನಿಸಿದರೆ, ಅದು ಸುಳ್ಳು. ಬಹುಮಾನ ಪಡೆಯಲು ಎಂದಿಗೂ ಹಣ ಕೊಡಬೇಕಾಗಿಲ್ಲ.',
      danger: 'ಇದು ಬಲೆ — ನಿಜವಾದ ಬಹುಮಾನಕ್ಕೆ ಯಾರೂ ಮೊದಲು ಹಣ ಕೇಳುವುದಿಲ್ಲ.',
      coach: ['ಹೇಳಿ — ಯಾವ ಶುಲ್ಕವನ್ನೂ ಕಟ್ಟಬೇಡಿ.',
              'ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ ಎನಿಸುವುದೆಲ್ಲ ಸುಳ್ಳು.',
              'ಹೂಡಿಕೆ ಮಾಡುವ ಮೊದಲು ಮನೆಯವರನ್ನು ಕೇಳಿ.']
    },
    panic: {
      icon: '🆘',
      label: 'HELP ಒತ್ತಿದ್ದಾರೆ — "ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ"',
      sub: '',
      why: '',
      danger: 'ಅವರು ಭಯದಿಂದ ಸಹಾಯ ಕೇಳಿದ್ದಾರೆ. ತಕ್ಷಣ ಕರೆ ಮಾಡಿ.',
      coach: ['ಶಾಂತವಾಗಿ ಕೇಳಿ ಏನಾಯಿತು — ಯಾರು, ಏನು ಹೇಳಿದರು.',
              'ಹಣದ ಯಾವುದೇ ಬೇಡಿಕೆ ಇದ್ದರೆ ಅದು ವಂಚನೆ.',
              'ಏನನ್ನಾದರೂ ಕಳುಹಿಸುವ ಅಥವಾ ಹೇಳುವ ಮೊದಲು ತಡೆಯಿರಿ.']
    }
  },

  ta: {
    police: {
      icon: '👮',
      label: 'போலீஸ் / CBI கைது செய்வதாக மிரட்டுகிறார்கள்',
      sub: '"டிஜிட்டல் அரெஸ்ட்", வாரண்ட், FIR',
      why: 'உண்மையான போலீஸ் ஒருபோதும் தொலைபேசி அல்லது வீடியோ அழைப்பில் கைது செய்வதில்லை. "டிஜிட்டல் அரெஸ்ட்" என்பதே கிடையாது.',
      danger: 'இது "டிஜிட்டல் அரெஸ்ட்" மோசடியுடன் பொருந்துகிறது — இந்தியாவின் மிக ஆபத்தான மோசடிகளில் ஒன்று. அவர்கள் எந்தத் தவறும் செய்யவில்லை.',
      coach: ['அமைதியாக இருங்கள். இது மோசடி என்று சொல்லுங்கள் — அந்த அழைப்பை உடனே துண்டிக்கச் சொல்லுங்கள்.',
              'உண்மையான போலீஸ் தொலைபேசி அல்லது வீடியோ அழைப்பில் யாரையும் கைது செய்வதில்லை.',
              'பணம் அனுப்புவதையோ OTP/PIN/கடவுச்சொல் கொடுப்பதையோ தடுங்கள்.']
    },
    transfer: {
      icon: '💸',
      label: 'யாரோ "பாதுகாப்பான கணக்கு"க்கு பணம் அனுப்பச் சொல்கிறார்கள்',
      sub: '"சரிபார்ப்புக்காக, திரும்பக் கிடைக்கும்"',
      why: 'உண்மையான எந்த அதிகாரியும் "பாதுகாப்பான கணக்கு"க்கு பணம் கேட்பதில்லை. ஒருமுறை அனுப்பினால் பணம் திரும்பி வராது.',
      danger: 'உண்மையான எந்த அதிகாரியும் "பாதுகாப்பான கணக்கு"க்கு பணம் கேட்பதில்லை. இது மோசடி.',
      coach: ['சொல்லுங்கள் — இப்போதே நிறுத்துங்கள், பணம் அனுப்ப வேண்டாம்.',
              'ஒருமுறை அனுப்பிய பணம் திரும்பி வராது.',
              'யாருக்கும் OTP அல்லது PIN கிடைக்க விடாதீர்கள்.']
    },
    voice: {
      icon: '🆘',
      label: 'குடும்பத்தினர் குரல் போல ஒருவர் அவசரமாக பணம் கேட்கிறார்',
      sub: 'விபத்து, கைது, "யாரிடமும் சொல்ல வேண்டாம்"',
      why: 'கணினி எந்தக் குரலையும் நகலெடுக்க முடியும். தொலைபேசியை வைத்துவிட்டு, குடும்பத்தினரின் சொந்த எண்ணுக்கு நீங்களே அழையுங்கள்.',
      danger: 'கணினி எந்தக் குரலையும் நகலெடுக்க முடியும் (வாய்ஸ் க்ளோன்). குரல் உண்மையாகத் தோன்றுவது எதையும் நிரூபிக்காது.',
      coach: ['அந்த நபரின் சொந்த எண்ணுக்கு நீங்களே அழைத்து உறுதிப்படுத்துங்கள்.',
              'குரல் உண்மையாகத் தோன்றினாலும் நம்ப வேண்டாம்.',
              'பணம் அனுப்பும் முன் எப்போதும் நிறுத்துங்கள்.']
    },
    link: {
      icon: '🔗',
      label: 'செய்தியில் ஒரு இணைப்பு — KYC / கணக்கு முடக்கம் / பணத் திருப்பம்',
      sub: '"இப்போதே கிளிக் செய்யுங்கள் இல்லையேல் கணக்கு முடக்கப்படும்"',
      why: 'வங்கி ஒருபோதும் செய்தி இணைப்பு மூலம் கணக்கை சரிசெய்யச் சொல்லாது. இணைப்பைத் திறக்க வேண்டாம். OTP அல்லது PIN யாருக்கும் கொடுக்க வேண்டாம்.',
      danger: 'இது ஃபிஷிங் இணைப்பு — உண்மை போலத் தோன்றும் போலி வங்கி இணையதளம்.',
      coach: ['அவர்கள் இணைப்பைத் திறக்க விடாதீர்கள்.',
              'OTP, PIN அல்லது கார்டு எண் யாருக்கும் வேண்டாம்.',
              'வங்கி செயலியை நீங்களே திறந்து சரிபாருங்கள்.']
    },
    prize: {
      icon: '🎁',
      label: 'பரிசு / லாட்டரி / பணத்தை இரட்டிப்பாக்கும் வாக்குறுதி',
      sub: '"முதலில் சிறிய கட்டணம் அனுப்புங்கள்"',
      why: 'உண்மையாக இருக்க முடியாத அளவு நன்றாக இருந்தால், அது பொய். பரிசு பெற ஒருபோதும் பணம் கட்ட வேண்டியதில்லை.',
      danger: 'இது ஒரு வலை — உண்மையான பரிசுக்கு யாரும் முதலில் பணம் கேட்பதில்லை.',
      coach: ['சொல்லுங்கள் — எந்தக் கட்டணமும் கட்ட வேண்டாம்.',
              'மிக நன்றாகத் தோன்றுவதெல்லாம் பொய்.',
              'முதலீடு செய்யும் முன் குடும்பத்திடம் கேளுங்கள்.']
    },
    panic: {
      icon: '🆘',
      label: 'HELP அழுத்தினார் — "எனக்குப் பயமாக இருக்கிறது"',
      sub: '',
      why: '',
      danger: 'அவர்கள் பயத்தில் உதவி கேட்டுள்ளார்கள். உடனே அழையுங்கள்.',
      coach: ['அமைதியாகக் கேளுங்கள் என்ன நடந்தது — யார், என்ன சொன்னார்கள்.',
              'பணம் கேட்கும் எந்தக் கோரிக்கையும் மோசடிதான்.',
              'எதையும் அனுப்பும் அல்லது சொல்லும் முன் தடுங்கள்.']
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

// US catalogue (English only for now — Spanish is blocked on a native-speaker
// review). Same five situations as India, but the agencies, danger lines and
// advice are US-specific: there is no "digital arrest" here, this is
// government impersonation and the "phantom hacker" scam.
const RULES_US = {
  en: {
    police: {
      icon: '👮',
      label: 'A "government agent" says you owe money or have a warrant',
      sub: 'IRS, Social Security, a warrant for your arrest',
      why: 'Real government agencies never call demanding immediate payment or threaten arrest over the phone. They contact you by mail first.',
      danger: 'This is a government impersonation scam. No real agency arrests you by phone or demands payment right away.',
      coach: ['Stay calm. Tell them it is a scam — hang up right away.',
              'No real government agency arrests anyone over the phone.',
              'Do not send money, gift cards, or account information.']
    },
    transfer: {
      icon: '💸',
      label: 'Someone says to move your money to a "safe account"',
      sub: 'Claims your bank account is compromised',
      why: 'No real bank or agent ever asks you to move money into a "safe account." Once sent, the money does not come back.',
      danger: 'This matches the "phantom hacker" scam. No real bank protects your money by having you transfer it.',
      coach: ['Say — stop now, do not send or transfer money.',
              'Money moved this way does not come back.',
              'Hang up and call your bank yourself using the number on your card.']
    },
    voice: {
      icon: '🆘',
      label: 'Someone who sounds like family urgently needs bail or hospital money',
      sub: '"Don\'t tell Mom and Dad", accident, arrest',
      why: 'A computer can copy any voice. Hang up and call your family member yourself on their own number.',
      danger: 'This matches the "grandparent scam." A cloned voice sounding real proves nothing.',
      coach: ['Call that person yourself on their own number to confirm.',
              'Even if the voice sounds exactly right, do not trust it.',
              'Never send money before you have confirmed by calling back.']
    },
    link: {
      icon: '🔗',
      label: 'A text or email link about a package, bank alert, or blocked account',
      sub: '"Click now or your account will be locked"',
      why: 'Banks and delivery services never ask you to fix an account through a text or email link. Do not click it or enter any information.',
      danger: 'This is a phishing link, a fake website made to look real.',
      coach: ['Do not click the link.',
              'Never enter a password, PIN, or card number after clicking a link like this.',
              'Open the real bank app or website yourself and check.']
    },
    prize: {
      icon: '🎁',
      label: 'A prize, lottery, or sweepstakes that needs a fee first',
      sub: '"Pay taxes or a fee to claim your winnings"',
      why: 'If it sounds too good to be true, it is false. You never have to pay money to receive a real prize.',
      danger: 'This is a sweepstakes scam. No real prize ever asks you to pay first.',
      coach: ['Say — do not pay any fee.',
              'A real prize never requires payment first.',
              'Ask your family before sending any money.']
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

// Scam catalogues are country-specific. The five situations are the same
// worldwide, but the named agencies, the danger lines and the advice differ.
const RULES = { IN: RULES_IN, US: RULES_US };
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
    helpDial: 'मदद: {label} दबाओ',
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
    reportTo: '{label} पर रिपोर्ट करो',
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
    histShow: 'पिछली सूचनाएँ',
    histHide: 'पिछली सूचनाएँ छिपाएँ',
    histLoading: 'लोड हो रहा है…',
    histEmpty: 'अभी कोई सूचना नहीं। यहाँ वे दिखाई देंगी।',
    histActive: 'चालू',
    histResolved: 'संभाल लिया',
    histMore: '{n} में से नवीनतम 50 दिखा रहे हैं।',
    iosInstall: '📲 iPhone पर सूचनाएँ तभी काम करती हैं जब KinGuard होम स्क्रीन पर हो। Share दबाएँ, फिर “Add to Home Screen” चुनें, और KinGuard को वहीं से खोलें। यह पेज खुला रहने पर सूचनाएँ यहाँ दिखती रहेंगी।',
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
    condMemoryT: 'याददाश्त / भ्रम',     condMemoryS: 'सरल मोड — सिर्फ़ एक बड़ा बटन',
    noPairTitle: 'यह फ़ोन जुड़ा हुआ नहीं है',
    noPairBody: 'इस फ़ोन से KinGuard आपके परिवार तक नहीं पहुँच सकता। अपने परिवार से इसे दुबारा सेट करने को कहें।',
    accountDivider: 'खाता',
    deleteAccount: 'मेरा खाता मिटाएँ',
    deleteSure: 'यह वापस नहीं हो सकता।',
    deleteWarnSenior: '{senior} का फ़ोन काम करना बंद कर देगा। उनका SOS बटन अब आप तक नहीं पहुँचेगा।',
    deleteWarnElder: 'बुज़ुर्ग का फ़ोन काम करना बंद कर देगा। उनका SOS बटन अब आप तक नहीं पहुँचेगा।',
    deleteAlso: 'यह भी हमेशा के लिए मिट जाएगा:',
    deleteItemLogin: 'आपका लॉगिन',
    deleteItemAlerts: 'सभी पुराने अलर्ट',
    deleteItemPhones: 'दोनों फ़ोन नंबर',
    deletePwLbl: 'पुष्टि के लिए अपना पासवर्ड डालें:',
    deleteCancel: 'रहने दें',
    deleteGo: 'हमेशा के लिए मिटाएँ',
    deleteDone: 'आपका खाता मिटा दिया गया है।'
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
    helpDial: 'సహాయం: {label} నొక్కండి',
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
    reportTo: '{label}కు రిపోర్ట్ చేయండి',
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
    histShow: 'గత సూచనలు',
    histHide: 'గత సూచనలను దాచు',
    histLoading: 'లోడ్ అవుతోంది…',
    histEmpty: 'ఇంకా సూచనలు లేవు. ఇక్కడ అవి కనిపిస్తాయి.',
    histActive: 'కొనసాగుతోంది',
    histResolved: 'చూసుకున్నాం',
    histMore: '{n}లో ఇటీవలి 50 చూపిస్తున్నాము.',
    iosInstall: '📲 iPhoneలో KinGuard హోమ్ స్క్రీన్‌లో ఉంటేనే సూచనలు పని చేస్తాయి. Share నొక్కి, “Add to Home Screen” ఎంచుకోండి, KinGuard‌ను అక్కడి నుండే తెరవండి. ఈ పేజీ తెరిచి ఉన్నంత వరకు సూచనలు ఇక్కడ కనిపిస్తాయి.',
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
    condMemoryT: 'జ్ఞాపకశక్తి / గందరగోళం', condMemoryS: 'సరళ మోడ్ — ఒకే ఒక పెద్ద బటన్',
    noPairTitle: 'ఈ ఫోన్ అనుసంధానం కాలేదు',
    noPairBody: 'ఈ ఫోన్ నుండి KinGuard మీ కుటుంబాన్ని చేరుకోలేదు. దీన్ని మళ్ళీ సెట్ చేయమని మీ కుటుంబాన్ని అడగండి.',
    accountDivider: 'ఖాతా',
    deleteAccount: 'నా ఖాతాను తొలగించు',
    deleteSure: 'దీన్ని తిరిగి పొందలేరు.',
    deleteWarnSenior: '{senior} ఫోన్ పని చేయడం ఆగిపోతుంది. వారి SOS బటన్ ఇక మీకు చేరదు.',
    deleteWarnElder: 'పెద్దవారి ఫోన్ పని చేయడం ఆగిపోతుంది. వారి SOS బటన్ ఇక మీకు చేరదు.',
    deleteAlso: 'ఇవి కూడా శాశ్వతంగా తొలగించబడతాయి:',
    deleteItemLogin: 'మీ లాగిన్',
    deleteItemAlerts: 'గత అన్ని హెచ్చరికలు',
    deleteItemPhones: 'రెండు ఫోన్ నంబర్లు',
    deletePwLbl: 'నిర్ధారించడానికి మీ పాస్‌వర్డ్ నమోదు చేయండి:',
    deleteCancel: 'రద్దు చేయి',
    deleteGo: 'శాశ్వతంగా తొలగించు',
    deleteDone: 'మీ ఖాతా తొలగించబడింది.'
  },

  kn: {
    possPhone: ' ಅವರ ಫೋನ್',
    tagline: 'ಕುಟುಂಬ ಸುರಕ್ಷತೆ',
    famTag: 'ಕುಟುಂಬ',
    setupTag: 'ಸೆಟಪ್',
    footSenior: 'ಮಾದರಿ — ಹಿರಿಯರ ಫೋನ್.',
    footFamily: 'ಮಾದರಿ — ಕುಟುಂಬದವರ ಫೋನ್.',
    setupFoot: 'ಕುಟುಂಬದ ಒಬ್ಬರು ಈ ಸೆಟಪ್ ಒಮ್ಮೆ ಮಾಡುತ್ತಾರೆ.',
    change: '↻ ಬದಲಾಯಿಸಿ',
    // senior
    panicT1: 'ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ',
    panicT2: 'ಈಗಲೇ ನನ್ನ ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ',
    panicAria: 'ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ, ನನ್ನ ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ',
    orChoose: 'ಅಥವಾ ಕೆಳಗಿನಿಂದ ಆಯ್ಕೆ ಮಾಡಿ',
    whatHappening: 'ಏನಾಗುತ್ತಿದೆ?',
    safeTitle: 'ನಿಲ್ಲಿ. ನೀವು ಸುರಕ್ಷಿತರಾಗಿದ್ದೀರಿ.',
    fraudTitle: 'ಇದು ವಂಚನೆ.',
    notifySending: '{fam} ಅವರಿಗೆ ಸೂಚನೆ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…',
    notifyFailed: 'ಸೂಚನೆ ಕಳುಹಿಸಲು ಆಗಲಿಲ್ಲ',
    notifyOk: '{fam} ಅವರಿಗೆ ಸೂಚನೆ ಹೋಗಿದೆ — ಅವರು ಕರೆ ಮಾಡುತ್ತಿದ್ದಾರೆ',
    callFam: '{fam} ಅವರಿಗೆ ಕರೆ ಮಾಡಿ',
    hangup: 'ಫೋನ್ ಇಡಿ',
    noMoney: 'ಹಣ ಕಳುಹಿಸಬೇಡಿ',
    resend: '↻  ಮತ್ತೆ ಸೂಚನೆ ಕಳುಹಿಸಿ',
    listen: '▶  ಕೇಳಿ',
    speaking: 'ಹೇಳಲಾಗುತ್ತಿದೆ…',
    back: '⟵  ಹಿಂದೆ',
    helpDial: 'ಸಹಾಯ: {label} ಒತ್ತಿ',
    speakPanic: 'ನಿಲ್ಲಿ. ನೀವು ಸುರಕ್ಷಿತರಾಗಿದ್ದೀರಿ. {fam} ಅವರಿಗೆ ಸೂಚನೆ ಕಳುಹಿಸಲಾಗಿದೆ. ಫೋನ್ ಇಡಿ. ಹಣ ಕಳುಹಿಸಬೇಡಿ.',
    scamTail: 'ಫೋನ್ ಇಡಿ. ಹಣ ಕಳುಹಿಸಬೇಡಿ.',
    // family
    calmNoAlert: '✅ ಯಾವ ಸೂಚನೆಯೂ ಇಲ್ಲ — ಎಲ್ಲ ಸರಿಯಾಗಿದೆ.',
    seniorSafe: '{senior} ಸುರಕ್ಷಿತರಾಗಿದ್ದಾರೆ.',
    pressHint: '{senior} ತಮ್ಮ ಫೋನಿನಲ್ಲಿ ಬಟನ್ ಒತ್ತಿದಾಗ, ಸೂಚನೆ ಇಲ್ಲಿ ತಾನಾಗಿಯೇ ಕಾಣಿಸುತ್ತದೆ.',
    today: 'ಇಂದು',
    important: '🛡️ ಮುಖ್ಯ',
    now: 'ಈಗ',
    maybeScam: '{senior} ಈಗ ವಂಚನೆಯಲ್ಲಿ ಸಿಲುಕಿರಬಹುದು',
    tapToOpen: 'ತೆರೆಯಲು ಒತ್ತಿ  ›',
    pressedHelp: 'HELP ಒತ್ತಿದ್ದಾರೆ',
    theyReported: 'ಅವರು ತಿಳಿಸಿದ್ದು',
    callSeniorNow: 'ಈಗಲೇ {senior} ಅವರಿಗೆ ಕರೆ ಮಾಡಿ',
    whatToSay: '💬 ಅವರಿಗೆ ಏನು ಹೇಳಬೇಕು',
    reportTo: '{label}ಕ್ಕೆ ದೂರು ನೀಡಿ',
    resolve: '✓  ಅವರು ಸುರಕ್ಷಿತರು — ನಾನು ನಿಭಾಯಿಸಿದ್ದೇನೆ',
    resolvedTitle: 'ಸುರಕ್ಷಿತ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ',
    resolvedWhy: 'ದಾಖಲಾಗಿದೆ. {senior} ಮತ್ತೆ ಗುರಿಯಾದರೆ, ನಿಮಗೆ ಇದೇ ರೀತಿ ಸೂಚನೆ ಬರುತ್ತದೆ.',
    report: 'ವರದಿ',
    time: 'ಸಮಯ',
    result: 'ಫಲಿತಾಂಶ',
    noMoneySent: 'ಯಾವ ಹಣವೂ ಹೋಗಿಲ್ಲ ✓',
    done: 'ಆಯಿತು  ⟳',
    enableAlerts: '🔔 ಮುಚ್ಚಿದ್ದಾಗಲೂ ಸೂಚನೆ ಪಡೆಯಿರಿ',
    alertsOn: '🔔 ಸೂಚನೆಗಳು ಚಾಲನೆಯಲ್ಲಿವೆ',
    alertsBlocked: 'ಸೂಚನೆಗೆ ಅನುಮತಿ ಸಿಗಲಿಲ್ಲ — ಫೋನ್ ಸೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ.',
    alertsFail: 'ಸೂಚನೆಗಳನ್ನು ಚಾಲನೆ ಮಾಡಲಾಗಲಿಲ್ಲ.',
    histShow: 'ಹಿಂದಿನ ಸೂಚನೆಗಳು',
    histHide: 'ಹಿಂದಿನ ಸೂಚನೆಗಳನ್ನು ಮರೆಮಾಡಿ',
    histLoading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
    histEmpty: 'ಇನ್ನೂ ಯಾವ ಸೂಚನೆಯೂ ಇಲ್ಲ. ಇಲ್ಲಿ ಅವು ಕಾಣಿಸುತ್ತವೆ.',
    histActive: 'ಚಾಲನೆಯಲ್ಲಿದೆ',
    histResolved: 'ನಿಭಾಯಿಸಲಾಗಿದೆ',
    histMore: '{n} ರಲ್ಲಿ ಇತ್ತೀಚಿನ 50 ತೋರಿಸುತ್ತಿದೆ.',
    iosInstall: '📲 iPhone ನಲ್ಲಿ KinGuard ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಇದ್ದಾಗ ಮಾತ್ರ ಸೂಚನೆಗಳು ಕೆಲಸ ಮಾಡುತ್ತವೆ. Share ಒತ್ತಿ, ನಂತರ "Add to Home Screen" ಆಯ್ಕೆ ಮಾಡಿ, KinGuard ಅನ್ನು ಅಲ್ಲಿಂದಲೇ ತೆರೆಯಿರಿ. ಈ ಪುಟ ತೆರೆದಿರುವಾಗ ಸೂಚನೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    // setup
    whichPhone: 'ಯಾವ ಫೋನ್ ಯಾರದು?',
    seniorNameLbl: 'ಹಿರಿಯರ ಹೆಸರು',
    seniorNamePh: 'ಉದಾ. ಕಮಲಾ',
    seniorPhoneLbl: 'ಹಿರಿಯರ ಫೋನ್ ನಂಬರ್',
    seniorPhonePh: 'ಕುಟುಂಬದವರು ಈ ನಂಬರಿಗೆ ಕರೆ ಮಾಡುತ್ತಾರೆ',
    familyNameLbl: 'ನಂಬಿಕೆಯ ಕುಟುಂಬದವರ ಹೆಸರು',
    familyNamePh: 'ಉದಾ. ಅರ್ಜುನ್',
    familyPhoneLbl: 'ಕುಟುಂಬದವರ ಫೋನ್ ನಂಬರ್',
    familyPhonePh: 'ಹಿರಿಯರು ಈ ನಂಬರಿಗೆ ಕರೆ ಮಾಡುತ್ತಾರೆ',
    langDivider: 'ಭಾಷೆ · Language',
    needsDivider: 'ಹಿರಿಯರ ಅಗತ್ಯಗಳು',
    needsHelp: 'ಅನ್ವಯಿಸುವುದನ್ನು ಆಯ್ಕೆ ಮಾಡಿ — ಫೋನ್ ತಾನಾಗಿಯೇ ಆ ರೀತಿ ತೆರೆಯುತ್ತದೆ.',
    save: 'ಉಳಿಸಿ',
    setupDone: 'ಸೆಟಪ್ ಪೂರ್ಣಗೊಂಡಿದೆ!',
    openPhones: 'ಈಗ ಫೋನ್ ತೆರೆಯಿರಿ:',
    saveError: 'ಉಳಿಸಲಾಗಿಲ್ಲ — ಸರ್ವರ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ?',
    openMyScreen: 'ನನ್ನ ಪರದೆ ತೆರೆಯಿರಿ',
    sendSeniorLink: 'ಈ ಲಿಂಕ್ ಅನ್ನು ಹಿರಿಯರ ಫೋನಿಗೆ ಕಳುಹಿಸಿ:',
    condHearingT: 'ಕಿವಿ ಕೇಳಿಸುವುದು ಕಷ್ಟ',  condHearingS: 'ಸೂಚನೆ ಬಂದಾಗ ಫೋನ್ ಕಂಪಿಸುತ್ತದೆ',
    condVisionT: 'ಕಣ್ಣು ಕಾಣುವುದು ಕಷ್ಟ',     condVisionS: 'ದೊಡ್ಡ ಅಕ್ಷರ, ಹೆಚ್ಚು ಕಾಂಟ್ರಾಸ್ಟ್, ತಾನಾಗಿಯೇ ಓದಿ ಹೇಳುವುದು',
    condTremorT: 'ಕೈ ನಡುಕ / ದುರ್ಬಲ ಹಿಡಿತ', condTremorS: 'ಇನ್ನೂ ದೊಡ್ಡ ಬಟನ್‌ಗಳು',
    condMemoryT: 'ನೆನಪು / ಗೊಂದಲ',          condMemoryS: 'ಸರಳ ಮೋಡ್ — ಒಂದೇ ದೊಡ್ಡ ಬಟನ್',
    noPairTitle: 'ಈ ಫೋನ್ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ',
    noPairBody: 'ಈ ಫೋನಿನಿಂದ KinGuard ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ತಲುಪಲು ಆಗುತ್ತಿಲ್ಲ. ಮತ್ತೆ ಸೆಟಪ್ ಮಾಡಲು ಕುಟುಂಬದವರಿಗೆ ಹೇಳಿ.',
    accountDivider: 'ಖಾತೆ',
    deleteAccount: 'ನನ್ನ ಖಾತೆಯನ್ನು ಅಳಿಸಿ',
    deleteSure: 'ಇದನ್ನು ವಾಪಸ್ ಪಡೆಯಲು ಆಗುವುದಿಲ್ಲ.',
    deleteWarnSenior: '{senior} ಅವರ ಫೋನ್ ಕೆಲಸ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸುತ್ತದೆ. ಅವರ SOS ಬಟನ್ ಇನ್ನು ನಿಮ್ಮನ್ನು ತಲುಪುವುದಿಲ್ಲ.',
    deleteWarnElder: 'ಹಿರಿಯರ ಫೋನ್ ಕೆಲಸ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸುತ್ತದೆ. ಅವರ SOS ಬಟನ್ ಇನ್ನು ನಿಮ್ಮನ್ನು ತಲುಪುವುದಿಲ್ಲ.',
    deleteAlso: 'ಇವೂ ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲ್ಪಡುತ್ತವೆ:',
    deleteItemLogin: 'ನಿಮ್ಮ ಲಾಗಿನ್',
    deleteItemAlerts: 'ಹಿಂದಿನ ಎಲ್ಲ ಸೂಚನೆಗಳು',
    deleteItemPhones: 'ಎರಡೂ ಫೋನ್ ನಂಬರ್‌ಗಳು',
    deletePwLbl: 'ಖಚಿತಪಡಿಸಲು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ:',
    deleteCancel: 'ರದ್ದುಮಾಡಿ',
    deleteGo: 'ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ',
    deleteDone: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅಳಿಸಲಾಗಿದೆ.'
  },

  ta: {
    possPhone: ' அவர்களின் ஃபோன்',
    tagline: 'குடும்பப் பாதுகாப்பு',
    famTag: 'குடும்பம்',
    setupTag: 'அமைப்பு',
    footSenior: 'மாதிரி — பெரியவரின் ஃபோன்.',
    footFamily: 'மாதிரி — குடும்பத்தினரின் ஃபோன்.',
    setupFoot: 'குடும்பத்தில் ஒருவர் இந்த அமைப்பை ஒருமுறை செய்வார்.',
    change: '↻ மாற்று',
    // senior
    panicT1: 'எனக்குப் பயமாக இருக்கிறது',
    panicT2: 'இப்போதே என் குடும்பத்தை அழையுங்கள்',
    panicAria: 'எனக்குப் பயமாக இருக்கிறது, என் குடும்பத்தை அழையுங்கள்',
    orChoose: 'அல்லது கீழே தேர்ந்தெடுக்கவும்',
    whatHappening: 'என்ன நடக்கிறது?',
    safeTitle: 'நிறுத்துங்கள். நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.',
    fraudTitle: 'இது மோசடி.',
    notifySending: '{fam} அவர்களுக்கு எச்சரிக்கை அனுப்பப்படுகிறது…',
    notifyFailed: 'எச்சரிக்கையை அனுப்ப முடியவில்லை',
    notifyOk: '{fam} அவர்களுக்கு எச்சரிக்கை சென்றது — அவர்கள் அழைக்கிறார்கள்',
    callFam: '{fam} அவர்களை அழையுங்கள்',
    hangup: 'ஃபோனை வையுங்கள்',
    noMoney: 'பணம் அனுப்ப வேண்டாம்',
    resend: '↻  மீண்டும் எச்சரிக்கை அனுப்பு',
    listen: '▶  கேளுங்கள்',
    speaking: 'சொல்லப்படுகிறது…',
    back: '⟵  பின்',
    helpDial: 'உதவி: {label} அழுத்துங்கள்',
    speakPanic: 'நிறுத்துங்கள். நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள். {fam} அவர்களுக்கு எச்சரிக்கை அனுப்பப்பட்டது. ஃபோனை வையுங்கள். பணம் அனுப்ப வேண்டாம்.',
    scamTail: 'ஃபோனை வையுங்கள். பணம் அனுப்ப வேண்டாம்.',
    // family
    calmNoAlert: '✅ எச்சரிக்கை எதுவும் இல்லை — எல்லாம் நலம்.',
    seniorSafe: '{senior} பாதுகாப்பாக இருக்கிறார்.',
    pressHint: '{senior} தமது ஃபோனில் ஒரு பொத்தானை அழுத்தினால், எச்சரிக்கை இங்கே தானாகவே தோன்றும்.',
    today: 'இன்று',
    important: '🛡️ முக்கியம்',
    now: 'இப்போது',
    maybeScam: '{senior} இப்போது ஒரு மோசடியில் சிக்கியிருக்கலாம்',
    tapToOpen: 'திறக்க அழுத்துங்கள்  ›',
    pressedHelp: 'HELP அழுத்தினார்',
    theyReported: 'அவர்கள் தெரிவித்தது',
    callSeniorNow: 'இப்போதே {senior} அவர்களை அழையுங்கள்',
    whatToSay: '💬 அவர்களிடம் என்ன சொல்ல வேண்டும்',
    reportTo: '{label}க்கு புகார் அளியுங்கள்',
    resolve: '✓  அவர்கள் பாதுகாப்பானவர் — நான் கவனித்துக் கொண்டேன்',
    resolvedTitle: 'பாதுகாப்பானது எனக் குறிக்கப்பட்டது',
    resolvedWhy: 'பதிவு செய்யப்பட்டது. {senior} மீண்டும் இலக்காக்கப்பட்டால், இதே போல் உங்களுக்கு எச்சரிக்கை வரும்.',
    report: 'அறிக்கை',
    time: 'நேரம்',
    result: 'முடிவு',
    noMoneySent: 'பணம் எதுவும் அனுப்பப்படவில்லை ✓',
    done: 'முடிந்தது  ⟳',
    enableAlerts: '🔔 மூடியிருக்கும்போதும் எச்சரிக்கை பெறுங்கள்',
    alertsOn: '🔔 எச்சரிக்கைகள் இயக்கத்தில் உள்ளன',
    alertsBlocked: 'அறிவிப்பு அனுமதி மறுக்கப்பட்டது — ஃபோன் அமைப்புகளில் அனுமதி கொடுங்கள்.',
    alertsFail: 'எச்சரிக்கைகளை இயக்க முடியவில்லை.',
    histShow: 'முந்தைய எச்சரிக்கைகள்',
    histHide: 'முந்தைய எச்சரிக்கைகளை மறை',
    histLoading: 'ஏற்றப்படுகிறது…',
    histEmpty: 'இதுவரை எச்சரிக்கை எதுவும் இல்லை. இங்கே அவை தோன்றும்.',
    histActive: 'இயங்குகிறது',
    histResolved: 'கவனிக்கப்பட்டது',
    histMore: '{n}இல் சமீபத்திய 50 காட்டப்படுகிறது.',
    iosInstall: '📲 iPhone இல் KinGuard ஹோம் ஸ்கிரீனில் இருந்தால் மட்டுமே எச்சரிக்கைகள் வேலை செய்யும். Share அழுத்தி, "Add to Home Screen" தேர்ந்தெடுத்து, KinGuard ஐ அங்கிருந்தே திறங்கள். இந்தப் பக்கம் திறந்திருக்கும் வரை எச்சரிக்கைகள் இங்கே தெரியும்.',
    // setup
    whichPhone: 'எந்த ஃபோன் யாருடையது?',
    seniorNameLbl: 'பெரியவரின் பெயர்',
    seniorNamePh: 'எ.கா. கமலா',
    seniorPhoneLbl: 'பெரியவரின் ஃபோன் எண்',
    seniorPhonePh: 'குடும்பத்தினர் இந்த எண்ணுக்கு அழைப்பார்கள்',
    familyNameLbl: 'நம்பகமான குடும்ப உறுப்பினரின் பெயர்',
    familyNamePh: 'எ.கா. அர்ஜுன்',
    familyPhoneLbl: 'குடும்ப உறுப்பினரின் ஃபோன் எண்',
    familyPhonePh: 'பெரியவர் இந்த எண்ணுக்கு அழைப்பார்',
    langDivider: 'மொழி · Language',
    needsDivider: 'பெரியவரின் தேவைகள்',
    needsHelp: 'பொருந்துவதைத் தேர்ந்தெடுங்கள் — ஃபோன் தானாகவே அவ்வாறு திறக்கும்.',
    save: 'சேமி',
    setupDone: 'அமைப்பு முடிந்தது!',
    openPhones: 'இப்போது ஃபோனைத் திறங்கள்:',
    saveError: 'சேமிக்கப்படவில்லை — சர்வர் இயங்குகிறதா?',
    openMyScreen: 'என் திரையைத் திற',
    sendSeniorLink: 'இந்த இணைப்பை பெரியவரின் ஃபோனுக்கு அனுப்புங்கள்:',
    condHearingT: 'கேட்பதில் சிரமம்',        condHearingS: 'எச்சரிக்கை வரும்போது ஃபோன் அதிரும்',
    condVisionT: 'பார்ப்பதில் சிரமம்',       condVisionS: 'பெரிய எழுத்து, அதிக மாறுபாடு, தானாகவே படித்துக் காட்டும்',
    condTremorT: 'கை நடுக்கம் / பலவீனமான பிடி', condTremorS: 'இன்னும் பெரிய பொத்தான்கள்',
    condMemoryT: 'நினைவு / குழப்பம்',        condMemoryS: 'எளிய முறை — ஒரே ஒரு பெரிய பொத்தான்',
    noPairTitle: 'இந்த ஃபோன் இணைக்கப்படவில்லை',
    noPairBody: 'இந்த ஃபோனிலிருந்து KinGuard உங்கள் குடும்பத்தை அடைய முடியவில்லை. மீண்டும் அமைக்க உங்கள் குடும்பத்தினரிடம் கேளுங்கள்.',
    accountDivider: 'கணக்கு',
    deleteAccount: 'என் கணக்கை நீக்கு',
    deleteSure: 'இதைத் திரும்பப் பெற முடியாது.',
    deleteWarnSenior: '{senior} அவர்களின் ஃபோன் வேலை செய்வதை நிறுத்தும். அவர்களின் SOS பொத்தான் இனி உங்களை அடையாது.',
    deleteWarnElder: 'பெரியவரின் ஃபோன் வேலை செய்வதை நிறுத்தும். அவர்களின் SOS பொத்தான் இனி உங்களை அடையாது.',
    deleteAlso: 'இவையும் நிரந்தரமாக நீக்கப்படும்:',
    deleteItemLogin: 'உங்கள் உள்நுழைவு',
    deleteItemAlerts: 'கடந்த எல்லா எச்சரிக்கைகளும்',
    deleteItemPhones: 'இரண்டு ஃபோன் எண்களும்',
    deletePwLbl: 'உறுதிப்படுத்த உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள்:',
    deleteCancel: 'ரத்து',
    deleteGo: 'நிரந்தரமாக நீக்கு',
    deleteDone: 'உங்கள் கணக்கு நீக்கப்பட்டது.'
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
    helpDial: 'Help: dial {label}',
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
    reportTo: 'Report to {label}',
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
    histShow: 'Past alerts',
    histHide: 'Hide past alerts',
    histLoading: 'Loading…',
    histEmpty: 'No alerts yet. This is where they will be listed.',
    histActive: 'Live',
    histResolved: 'Handled',
    histMore: 'Showing the most recent 50 of {n}.',
    iosInstall: '📲 On iPhone, alerts only work once KinGuard is on your Home Screen. Tap Share, then “Add to Home Screen”, and open KinGuard from there. This page still shows alerts while it is open.',
    // setup
    whichPhone: 'Which phone is whose?',
    seniorNameLbl: 'Elder’s name',
    seniorNamePh: 'e.g. {name}',
    seniorPhoneLbl: 'Elder’s phone number',
    seniorPhonePh: 'Family will call this number',
    familyNameLbl: 'Trusted family member’s name',
    familyNamePh: 'e.g. {name}',
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
    condMemoryT: 'Memory / confusion', condMemoryS: 'Simple mode — just one big button',
    noPairTitle: 'This phone is not connected',
    noPairBody: 'KinGuard cannot reach your family from this phone. Ask your family to set it up again.',
    accountDivider: 'Account',
    deleteAccount: 'Delete my account',
    deleteSure: 'This cannot be undone.',
    deleteWarnSenior: '{senior}’s phone will stop working. Their SOS button will no longer reach you.',
    deleteWarnElder: 'The elder’s phone will stop working. Their SOS button will no longer reach you.',
    deleteAlso: 'Also deleted forever:',
    deleteItemLogin: 'Your login',
    deleteItemAlerts: 'Every past alert',
    deleteItemPhones: 'Both phone numbers',
    deletePwLbl: 'Enter your password to confirm:',
    deleteCancel: 'Cancel',
    deleteGo: 'Delete forever',
    deleteDone: 'Your account has been deleted.'
  }
};

// Order shown on the senior's situation grid (panic is the separate red button).
const COUNTRIES = {
  IN: {
    name: 'India',
    langs: ['hi', 'te', 'kn', 'ta', 'en'],
    // A device may not have a voice installed for every language; if so,
    // speech silently does nothing while the visual guidance still works.
    tts:  { hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN', ta: 'ta-IN', en: 'en-IN' },
    // Order shown on the senior's grid (panic is the separate red button).
    grid: ['police', 'transfer', 'voice', 'link', 'prize'],
    emergency: '112',
    report: {
      tel:   '1930',
      label: '1930',
      hours: null,   // null = staffed 24/7, so the call always works
      web:   []
    },
    // Shown as "e.g. {name}" placeholders in the setup form. Only 'en' uses
    // these — hi/te/kn/ta keep their own hardcoded names since those
    // languages are only ever offered for an India pair.
    sampleNames: { senior: 'Kamala', family: 'Arjun' }
  },
  US: {
    name: 'United States',
    langs: ['en'],
    tts:  { en: 'en-US' },
    grid: ['police', 'transfer', 'voice', 'link', 'prize'],
    emergency: '911',
    report: {
      tel:   '877-908-3360',
      label: 'AARP Helpline',
      // Not staffed 24/7 like India's 1930 — a US elder calling outside these
      // hours reaches nobody, which is why FTC/IC3 web reports exist beside it.
      hours: 'Mon-Fri, 8am-8pm ET',
      web:   ['reportfraud.ftc.gov', 'ic3.gov']
    },
    sampleNames: { senior: 'Linda', family: 'Bob' }
  }
};

// Display name for each language, in its own script. Language-only, so it is
// shared across countries; COUNTRIES[c].langs decides which ones are offered.
const LANG_NAMES = {
  hi: 'हिन्दी',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
  en: 'English'
};  

const DEFAULT_COUNTRY = 'IN';

// Resolve a possibly-unknown country to one we actually have. Every existing
// pair has no country stored, so they land on India — exactly what they were
// already being shown, which is what makes this migration invisible to them.
function countryOf(cfg){
  const c = cfg && cfg.country;
  return (c && COUNTRIES[c] && RULES[c]) ? c : DEFAULT_COUNTRY;
}

// Resolve a possibly-unknown language to one we actually have, falling back to
// English. Use everywhere a cfg.lang is read.
function langOf(cfg){
const c = countryOf(cfg);
  const l = cfg && cfg.lang;
  return (l && UI[l] && RULES[c] && RULES[c][l]) ? l : 'en';
}

// names, defaults until onboarding overwrites them
const SENIOR_NAME = 'Kamala';
const FAMILY_NAME = 'Arjun';
