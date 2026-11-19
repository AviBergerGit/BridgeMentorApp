// Display-only, explicitly reviewed transcriptions of the existing question bank.
// No answers, question IDs, source questions or progress keys change here.
export const DEFENSE_DIAGRAMS = {
 d1q1:{text:'נגד NT.',ranks:'Q J 4 3',ask:'איזה קלף מובילים?'},
 d1q2:{text:'נגד NT.',ranks:'A K 7 6 4 2',ask:'איזה קלף מובילים?'},
 d1q3:{text:'נגד NT.',ranks:'K J 10 6 2',ask:'איזה קלף מובילים?'},
 d1q4:{text:'נגד NT.',ranks:'A K 5 4 3 2',ask:'איזה קלף מובילים?'},
 d1q5:{text:'נגד חוזה צבע.',ranks:'Q J 4 3',ask:'איזה קלף מובילים?'},
 d1q6:{text:'נגד חוזה צבע.',ranks:'A K 7 6 4 2',ask:'איזה קלף מובילים?'},
 d1q13:{illustrativeLow:true,text:'הובלת ♥6 בצבע השותף. הכרוז משחק קטן מהדומם, השותף זוכה ב-A♥ וממשיך ♥K. הדומם משחק קטן.',playOrder:['you','dummy','partner','declarer'],hand:{h:'862'},scope:'ההחזקה בהארט בתחילת המשחק',played:[{role:'partner',s:'h',r:'K'},{role:'dummy',s:'h',r:'4'}],ask:'מה אתה משליך?'},
 d1q14:{text:'נגד חוזה בשליט.',ranks:'K Q',ask:'מה מובילים מראש הרצף?'},
 d1q16:{text:'נגד חוזה בשליט.',ranks:'A Q J 10 2',ask:'מה נכון?'},
 d1q17:{text:'השותף הכריז ♥ ואתה רוצה להוביל אליו.',hand:{h:'82'},ask:'במה מובילים?'},
 d1q18:{text:'אתה פותח סדרה חדשה באמצע המשחק, בלי מכובד.',ranks:'9 6 2',ask:'מה ההובלה הנכונה, ומה זורקים כשהשותף ממשיך בסדרה?'},
 d1q24:{text:'',hand:{d:'9762'},ask:'איזה קלף מובילים?'},
 d1q29:{text:'נגד 4♠. יש לך סינגלטון בהארט.',hand:{s:'QT92',h:'7'},scope:'מוצגות רק שתי הסדרות שנמסרו בתרגיל',ask:'מה נכון?'},
 d1q30:{text:'תמונה דאבלטון, לדוגמה:',hand:{h:'Qx'},title:'דוגמה להחזקה',ask:'מתי מובילים מתמונה דאבלטון?'},
 d2q1:{text:'השותף מוביל בקטן ובדומם קלפים קטנים.',playOrder:['partner','dummy','you','declarer'],ranks:'Q J',dummyRanks:'8 6',scope:'הקלפים הקטנים להמחשה בלבד; הסדרה לא צוינה בתרגיל',played:[{role:'partner',r:'2'},{role:'dummy',r:'4'}],ask:'מה משחקים ביד השלישית?'},
 d2q2:{text:'השותף מוביל ב-2, בדומם נמצאת ה-Q, והכרוז משחק 4.',playOrder:['partner','dummy','you','declarer'],ranks:'K J 9',played:[{role:'partner',r:'2'}],ask:'מה שמים?'},
 d2q7:{illustrativeLow:true,text:'השותף מוביל בספייד קטן. הכרוז משחק את ה-A מהדומם.',playOrder:['partner','dummy','you','declarer'],hand:{s:'J72'},dummy:{s:'K3'},played:[{role:'partner',s:'s',r:'4'},{role:'dummy',s:'s',r:'A'}],ask:'האם ה-J מספיק כדי לעודד?'},
 d2q9:{text:'נגד 3NT: הובלת A♠ והשותף שם 7 (מעודד).',playOrder:['you','dummy','partner','declarer'],hand:{s:'KJ64'},scope:'הקלפים שנשארו בספייד',played:[{role:'you',s:'s',r:'A'},{role:'partner',s:'s',r:'7'}],ask:'איך ממשיכים?'},
 d2q10:{text:'דרום משחק 4♥. מערב מוביל 3♠, והכרוז מבקש 2♠ מהדומם. אתם במזרח. ההנחה היא שהובלה בקטן מראה תמונה.',you:'מזרח',dummySeat:'צפון',hand:{s:'AJ4'},dummy:{s:'Q7'},played:[{seat:'מערב',s:'s',r:'3'},{seat:'צפון',s:'s',r:'2'}],ask:'איזה קלף תשחקו?'},
 d2q11:{text:'דרום משחק 4♥. מערב מוביל 4♠, ומהדומם משוחק 2♠. אתם במזרח. הובלה בקטן מראה תמונה, והשותף אינו מוביל מתחת לאס נגד שליט.',you:'מזרח',dummySeat:'צפון',hand:{s:'KT3'},dummy:{s:'Q7'},played:[{seat:'מערב',s:'s',r:'4'},{seat:'צפון',s:'s',r:'2'}],ask:'מה תשחקו?'},
 // Declarer is South, so the dummy is North; the dummy answers the partner's
 // lead before the user (third hand), so the user is East and the leader West.
 d2q12:{text:'דרום משחק 4♥. השותף מוביל מלך בסדרה צדדית והדומם משחק קטן.',you:'מזרח',dummySeat:'צפון',ranks:'A 2',dummyRanks:'7 6',played:[{seat:'מערב',r:'K'},{seat:'צפון',r:'4'}],ask:'מה תשחקו ביד השלישית?'},
 // Same derivation as d2q12: declarer South -> dummy North; the dummy plays
 // right after the lead and the user after the dummy, so the user is East.
 d2q13:{text:'דרום משחק 3NT. השותף מוביל מלך והדומם משחק קטן. השותף מוביל מלך מרצף חזק כגון KQJ או KQ10.',you:'מזרח',dummySeat:'צפון',ranks:'A 2',dummyRanks:'7 6',played:[{seat:'מערב',r:'K'},{seat:'צפון',r:'4'}],ask:'מה תשחקו?'},
 d2q14:{text:'דרום משחק 3NT. מערב מוביל Q♠ ומהדומם משוחק קטן. אתם במזרח.',you:'מזרח',dummySeat:'צפון',hand:{s:'K3'},dummy:{s:'87'},played:[{seat:'מערב',s:'s',r:'Q'},{seat:'צפון',s:'s',r:'4'}],ask:'מה תשחקו ביד השלישית?'},
 d3q1:{illustrativeLow:true,text:'הכרוז משחק 2♦ ומוביל קלף קטן מידו. הדומם יושב אחריכם ואתם ביד שנייה. אין לכם מידע מיוחד מההכרזה ואין סיבה לחרוג מהכלל.',playOrder:['declarer','you','dummy','partner'],hand:{d:'KT5'},dummy:{d:'Q73'},played:[{role:'declarer',s:'d',r:'2'}],ask:'מה תשחקו?'},
 // The original d3q2 names South as declarer and North as defender. Preserve
 // that wording; do not derive a dummy compass seat from contradictory seats.
 d3q2:{text:'דרום משחק 4♠. אחרי הוצאת שליטים הכרוז מוביל 4♣ מידו. הדומם יושב אחריכם. אתם בצפון.',hand:{c:'AT53'},dummy:{c:'J72'},ask:'מה תשחקו?'},
 d3q4:{text:'הכרוז משחק Q♥ מהיד. אתם ביד שנייה. ידוע שה-A♥ אצל השותף.',playOrder:['declarer','you','dummy','partner'],hand:{h:'K95'},dummy:{h:'J763'},played:[{role:'declarer',s:'h',r:'Q'}],ask:'מה תשחקו?'},
 d3q5:{text:'הכרוז משחק Q♥ מהיד. אתם ביד שנייה.',playOrder:['declarer','you','dummy','partner'],hand:{h:'K985'},dummy:{h:'A763'},played:[{role:'declarer',s:'h',r:'Q'}],ask:'מה תשחקו?'},
 d3q6:{text:'הכרוז משחק Q♥ מהיד. אתם ביד שנייה.',playOrder:['declarer','you','dummy','partner'],hand:{h:'K75'},dummy:{h:'AJ6'},played:[{role:'declarer',s:'h',r:'Q'}],ask:'מה תשחקו?'},
 d3q7:{text:'הכרוז משחק Q♥ מהיד. אתם ביד שנייה.',playOrder:['declarer','you','dummy','partner'],hand:{h:'K752'},dummy:{h:'AJT9'},played:[{role:'declarer',s:'h',r:'Q'}],ask:'מה תשחקו?'},
 d3q8:{text:'הכרוז משחק Q♥ מהיד. אתם ביד שנייה.',playOrder:['declarer','you','dummy','partner'],hand:{h:'K75'},dummy:{h:'AJ9'},played:[{role:'declarer',s:'h',r:'Q'}],ask:'מה תשחקו?'},
 d2q15:{text:'מערב משחק 6♠. אתם בדרום והדומם במזרח. צפון מוביל 8♣ והדומם משחק 2♣.',you:'דרום',dummySeat:'מזרח',dummy:{s:'Q6543',h:'AJ',d:'32',c:'T96'},played:[{seat:'צפון',s:'c',r:'8'},{seat:'מזרח',s:'c',r:'2'}],ask:'מה תשחקו?'},
 d2q16:{text:'מערב משחק 6♠. אתם בדרום והדומם במזרח. צפון מוביל 8♣ והדומם משחק 10♣.',you:'דרום',dummySeat:'מזרח',dummy:{s:'Q6543',h:'AJ',d:'32',c:'962'},played:[{seat:'צפון',s:'c',r:'8'},{seat:'מזרח',s:'c',r:'10'}],ask:'האם תכסו במלך?'},
 d2q17:{text:'מערב משחק 4♠ אחרי ההכרזה המוצגת. אתם בדרום והדומם במזרח. צפון מוביל 10♣ והדומם משחק 3♣.',you:'דרום',dummySeat:'מזרח',dummy:{s:'QJT6',h:'J62',d:'K76',c:'Q9'},played:[{seat:'צפון',s:'c',r:'10'},{seat:'מזרח',s:'c',r:'3'}],ask:'האם תזכו באס ותחזירו קלאב?'},
 d2q18:{text:'מערב משחק 4♠ אחרי ההכרזה המוצגת. אתם בדרום והדומם במזרח. צפון מוביל 10♣ והדומם משחק Q♣.',you:'דרום',dummySeat:'מזרח',dummy:{s:'QJT6',h:'J62',d:'K76',c:'93'},played:[{seat:'צפון',s:'c',r:'10'},{seat:'מזרח',s:'c',r:'Q'}],ask:'מה תשחקו?'},
 d2q19:{text:'מערב משחק 4♠ אחרי ההכרזה המוצגת. אתם בדרום והדומם במזרח. צפון מוביל 10♣.',you:'דרום',dummySeat:'מזרח',dummy:{s:'QJT6',h:'J62',d:'K76',c:'Q93'},played:[{seat:'צפון',s:'c',r:'10'}],ask:'איך מסיקים שהשותף התחיל בדאבלטון בקלאב ולא בסינגלטון?'},
 // North leads and the dummy answers the lead immediately, so play runs
 // N -> E -> S -> W: the dummy is East and the declarer West.
 d2q20:{text:'השותף שלכם בצפון מוביל J♦ נגד 4♠. הדומם משחק 5♦. אתם בדרום.',you:'דרום',dummySeat:'מזרח',hand:{d:'A74'},dummy:{d:'K6'},played:[{seat:'צפון',s:'d',r:'J'},{seat:'מזרח',s:'d',r:'5'}],ask:'מה תשחקו?'},
 d3q9:{illustrativeLow:true,text:'הכרוז משחק קלף קטן ואתם ביד שנייה עם שני מכובדים צמודים.',playOrder:['declarer','you','dummy','partner'],ranks:'K Q 3',title:'דוגמה להחזקה',played:[{role:'declarer',r:'2'}],ask:'מה הכלל?'},
 d3q10:{illustrativeLow:true,text:'אתם ביד שנייה והכרוז משחק קלף קטן.',playOrder:['declarer','you','dummy','partner'],ranks:'K Q 3',played:[{role:'declarer',r:'2'}],ask:'מדוע משחקים את ה-Q ולא קלף קטן ולא את ה-K?'},
 d3q11:{illustrativeLow:true,text:'אתם ביד שנייה. הכרוז משחק קלף קטן.',playOrder:['declarer','you','dummy','partner'],ranks:'Q J 10 4',scope:'הסדרה לא צוינה בתרגיל',played:[{role:'declarer',r:'2'}],ask:'מה תשחקו?'},
 d3q13:{text:'הכרוז משחק Q♦ מידו. אתם ביד שנייה.',playOrder:['declarer','you','dummy','partner'],hand:{d:'A43'},dummy:{d:'K62'},played:[{role:'declarer',s:'d',r:'Q'}],ask:'האם לשים את האס?'},
 d3q14:{text:'הכרוז משחק Q♦ מידו. אתם ביד שנייה.',playOrder:['declarer','you','dummy','partner'],hand:{d:'A43'},dummy:{d:'762'},played:[{role:'declarer',s:'d',r:'Q'}],ask:'האם לשים את האס?'},
 d3q15:{text:'הדומם מוביל Q♦. אתם ביד שנייה.',playOrder:['dummy','you','declarer','partner'],hand:{d:'K42'},dummy:{d:'J3'},played:[{role:'dummy',s:'d',r:'Q'}],ask:'האם לכסות במלך?'},
 d3q17:{text:'הכרזה: מערב 2♠ חלש, מזרח 2NT (שואל), מערב 3♥, מזרח 4♠. אתם בצפון ומובילים K♥. הדומם במזרח. הכרוז זוכה באס הארט ומשחק Q♠ מידו.',you:'צפון',dummySeat:'מזרח',hand:{s:'K76'},dummy:{s:'854',h:'765',d:'AKQJ',c:'A96'},scope:'ביד שלך מוצגת רק סדרת הספייד',played:[{seat:'מערב',s:'s',r:'Q'}],ask:'האם תכסו במלך?'},
 d3q18:{text:'הכרזה: מערב 1♠, צפון 2♣, מזרח 3♣ (תמיכה בספייד), מערב 4♠. אתם בדרום. צפון גובה שלוש לקיחות בקלאב. הכרוז עובר לדומם ומשחק משם J♠ לכיוונכם.',you:'דרום',dummySeat:'מזרח',hand:{s:'Q75'},dummy:{s:'A32'},scope:'הקלפים שנשארו בספייד ברגע ההחלטה',played:[{seat:'מזרח',s:'s',r:'J'}],ask:'האם תכסו במלכה?'}
};
