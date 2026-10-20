import React, { useState, useEffect, useMemo } from 'react';
import './mentor.css';

/* ============ BRIDGE-MENTOR - prototype v1.1.0 ============ */

const EMAIL = "bridgetrainergame@gmail.com";
const VERSION = "1.1.12";

const QUESTIONS = [
  { id:"s2b1", topic:"t1", wrong:["2♣", "1NT", "3NT"], dealer:"מערב", vul:"מזרח-מערב", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון התערב.",
    hand:{s:"AK5",h:"J",d:"T654",c:"QJ876"}, hcp:11,
    auction:[["מערב","1♣"],["צפון","1♥"]],
    answer:"2♥", expl:"קיו-ביד (הכרזת סדרת ההתערבות): 10+ נקודות עם תמיכה בסדרת הפותח.",
    full:"1♣ (1♥) 2♥ (Pass) 3NT (Pass) Pass Pass" },
  { id:"s2b2", topic:"t7", wrong:["Pass", "3♥", "4♣"], dealer:"מערב", vul:"כולם", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון התערב בהכרזת מנע.",
    hand:{s:"KJ63",h:"A75",d:"K9",c:"J974"}, hcp:12,
    auction:[["מערב","1♣"],["צפון","3♦"]],
    answer:"X", expl:"נגטיב דבל: מראה את שתי סדרות המייג'ור.",
    full:"1♣ (3♦) X (Pass) 3♥ (Pass) 3NT (Pass) 4♠ (Pass) Pass Pass" },
  { id:"s2b3", topic:"t2", wrong:["Pass", "2♥", "3♥"], dealer:"מערב", vul:"ללא", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון התערב.",
    hand:{s:"975",h:"K8",d:"K732",c:"KQ32"}, hcp:11,
    auction:[["מערב","1♥"],["צפון","2♣"]],
    answer:"2NT", expl:"טבעי, 11-12 נקודות עם עוצר בסדרת ההתערבות.",
    full:"1♥ (2♣) 2NT (Pass) 3NT (Pass) Pass Pass" },
  { id:"s2b4", topic:"t1", wrong:["2♦", "1NT", "2♥"], dealer:"מערב", vul:"כולם", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון התערב.",
    hand:{s:"97",h:"54",d:"KQ432",c:"KJ76"}, hcp:9,
    auction:[["מערב","1♥"],["צפון","1♠"]],
    answer:"X", expl:"כששתי סדרות המייג'ור הוכרזו, X מראה את שתי סדרות המיינור, 6+ נקודות.",
    full:"1♥ (1♠) X (2♠) 3♣ (Pass) Pass Pass" },
  { id:"s2b5", topic:"t2", wrong:["Pass", "2♠", "2NT"], dealer:"מערב", vul:"כולם", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון התערב.",
    hand:{s:"T2",h:"J92",d:"KQJ",c:"AT842"}, hcp:11,
    auction:[["מערב","1♠"],["צפון","2♥"]],
    answer:"3♣", expl:"סדרה חדשה ללא קפיצה: 5+ קלפים ו-11+ נקודות, מחייבת.",
    full:"1♠ (2♥) 3♣ (Pass) 3♠ (Pass) Pass Pass" },
  { id:"s2b6", topic:"t1", wrong:["1NT", "2♦", "Pass"], dealer:"מערב", vul:"מזרח-מערב", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון התערב.",
    hand:{s:"QT764",h:"A42",d:"A82",c:"K6"}, hcp:13,
    auction:[["מערב","1♣"],["צפון","1♦"]],
    answer:"1♠", expl:"אחרי התערבות 1♦ מספיקים 4 קלפים בסדרה חדשה בגובה 1, עם 6+ נקודות.",
    full:"1♣ (1♦) 1♠ (Pass) 1NT (Pass) 2♣ (Pass) 2♥ (Pass) 3NT (Pass) 4♠ (Pass) Pass Pass" },
  { id:"s3b1", topic:"t3", wrong:["Pass", "2♣", "2♥"], dealer:"מערב", vul:"ללא", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון כפל (כפל הוצאה).",
    hand:{s:"T2",h:"AT762",d:"K64",c:"A86"}, hcp:11,
    auction:[["מערב","1♣"],["צפון","X"]],
    answer:"XX", expl:"רידאבל: 10+ נקודות, ללא התאמה מובהקת עדיין; בהמשך מזרח מכריז 2♥.",
    full:"1♣ (X) XX (1♠) Pass (Pass) 2♥ (Pass) 4♥ (Pass) Pass Pass" },
  { id:"s3b2", topic:"t4", wrong:["XX", "2♦", "2♥"], dealer:"מערב", vul:"צפון-דרום", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון כפל (כפל הוצאה).",
    hand:{s:"T74",h:"975",d:"6",c:"AKJ632"}, hcp:8,
    auction:[["מערב","1♦"],["צפון","X"]],
    answer:"2♣", expl:"סדרה חדשה לאחר הכפל, טבעית ולא מחייבת.",
    full:"1♦ (X) 2♣ (Pass) Pass Pass" },
  { id:"s3b3", topic:"t3", wrong:["Pass", "2♥", "2♣"], dealer:"מערב", vul:"כולם", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון כפל (כפל הוצאה).",
    hand:{s:"J96",h:"T842",d:"A9",c:"AK97"}, hcp:12,
    auction:[["מערב","1♦"],["צפון","X"]],
    answer:"XX", expl:"רידאבל: 10+ נקודות; מכין עונש או משחק מלא. בהמשך מזרח כופל את 2♣ לעונש.",
    full:"1♦ (X) XX (2♣) Pass (Pass) X (Pass) Pass Pass" },
  { id:"s3b4", topic:"t4", wrong:["XX", "2♦", "4♠"], dealer:"מערב", vul:"צפון-דרום", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון כפל (כפל הוצאה).",
    hand:{s:"QJ72",h:"843",d:"65432",c:"7"}, hcp:3,
    auction:[["מערב","1♠"],["צפון","X"]],
    answer:"3♠", expl:"תמיכה בקפיצה: יד חלשה עם תמיכה מרובה, מפריע ליריבים.",
    full:"1♠ (X) 3♠ (Pass) Pass Pass" },
  { id:"s3b5", topic:"t4", wrong:["XX", "3♦", "1NT"], dealer:"מערב", vul:"צפון-דרום", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון כפל (כפל הוצאה).",
    hand:{s:"764",h:"QT7654",d:"Q",c:"J52"}, hcp:5,
    auction:[["מערב","1♦"],["צפון","X"]],
    answer:"2♥", expl:"סדרה חדשה לאחר הכפל: טבעית, לא מחייבת, יציאה מחוזה מוכפל גרוע.",
    full:"1♦ (X) 2♥ (Pass) Pass Pass" },
  { id:"s3b6", topic:"t3", wrong:["Pass", "2♠", "3♠"], dealer:"מערב", vul:"מזרח-מערב", ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח, צפון כפל (כפל הוצאה).",
    hand:{s:"843",h:"T87",d:"AK4",c:"AQT7"}, hcp:13,
    auction:[["מערב","1♠"],["צפון","X"]],
    answer:"XX", expl:"רידאבל: 10+ נקודות; בהמשך מזרח קופץ ל-4♠.",
    full:"1♠ (X) XX (2♥) Pass (Pass) 4♠ (Pass) Pass Pass" },
  { id:"s4b1", topic:"t5", wrong:["Pass", "X", "4♥"], ctx:"השותף פתח 1♥ והיריב התערב 1NT. מה תכריז?",
    hand:{s:"432",h:"QT63",d:"9876",c:"K2"}, hcp:5,
    auction:[["שותף","1♥"],["יריב","1NT"]],
    answer:"3♥", expl:"הכרזת הפרעה עם 5 נקודות גבוהות בלבד והתאמה של 9 קלפים (בהערת קלפים)." },
  { id:"s4b2", topic:"t5", wrong:["Pass", "3♥", "4♥"], ctx:"השותף פתח 1♥ והיריב התערב 1NT. מה תכריז?",
    hand:{s:"K43",h:"QT6",d:"A64",c:"5432"}, hcp:9,
    auction:[["שותף","1♥"],["יריב","1NT"]],
    answer:"X", expl:"למרות התמיכה בסדרת השותף נעדיף כפל מעניש. לשותפות שלנו יותר נקודות מאשר ליריבים והסיכוי להכשיל 1NT גבוה." },
  { id:"s4b3", topic:"t5", wrong:["Pass", "X", "2♥"], ctx:"השותף פתח 1♥ והיריב התערב 1NT. מה תכריז?",
    hand:{s:"432",h:"2",d:"432",c:"KQT986"}, hcp:5,
    auction:[["שותף","1♥"],["יריב","1NT"]],
    answer:"2♣", expl:"בידינו רק 5 נקודות אך כדאי להתחרות על החוזה החלקי עם שישייה טובה בקלאב." },
  { id:"s4b4", topic:"t5", wrong:["Pass", "3♥", "4♥"], ctx:"השותף פתח 1♥ והיריב התערב 1NT. מה תכריז?",
    hand:{s:"J42",h:"KQT986",d:"K63",c:"2"}, hcp:9,
    auction:[["שותף","1♥"],["יריב","1NT"]],
    answer:"X", expl:"למרות השישה בהארט נעדיף כפל מעניש. הפלת 1NT תעניק לנו ניקוד גבוה יותר מאשר ביצוע 2♥." },
  { id:"s4b5", topic:"t6", wrong:["XX", "2♥", "2♦"], ctx:"יריב פתח, השותף התערב 1NT, היריב הגיב. אתה המשיב למתערב.",
    hand:{s:"6532",h:"K862",d:"JT84",c:"9"}, hcp:4,
    auction:[["יריב","1♣"],["שותף","1NT"],["יריב","X"]],
    answer:"Pass", expl:"טרנספר לרידאבל על מנת להתחיל שיח רביעיות ולצאת מחוזה נוראי ב-NT." },
  { id:"s4b6", topic:"t6", wrong:["Pass", "2♥", "4♥"], ctx:"יריב פתח, השותף התערב 1NT, היריב הגיב. אתה המשיב למתערב.",
    hand:{s:"KJ",h:"KQ83",d:"JT92",c:"983"}, hcp:10,
    auction:[["יריב","1♣"],["שותף","1NT"],["יריב","2♣"]],
    answer:"3♣", expl:"קיוביד לבירור על רביעיה במייג'ור בדרך למשחק מלא." },
  { id:"s4b7", topic:"t6", wrong:["Pass", "2♦", "2♠"], ctx:"יריב פתח, השותף התערב 1NT, היריב הגיב. אתה המשיב למתערב.",
    hand:{s:"432",h:"Q",d:"876",c:"986543"}, hcp:2,
    auction:[["יריב","1♥"],["שותף","1NT"],["יריב","X"]],
    answer:"XX", expl:"טרנספר לקלאב על מנת לנחות בחוזה גרוע פחות מ-1NT." },
  { id:"s4b8", topic:"t6", wrong:["Pass", "X", "4♥"], ctx:"יריב פתח, השותף התערב 1NT, היריב הגיב. אתה המשיב למתערב.",
    hand:{s:"KJT93",h:"4",d:"Q653",c:"K72"}, hcp:9,
    auction:[["יריב","1♥"],["שותף","1NT"],["יריב","3♥"]],
    answer:"3♠", expl:"הצעה לחוזה בספייד עם חמישייה - פורסינג למשחק מלא." },
  { id:"s6b1", topic:"t8", wrong:["Pass", "1♥", "1♦"], dealer:"מערב", vul:"ללא", ctx:"אתה דרום (מושב רביעי). מערב פתח, צפון ומזרח עברו.", you:"דרום",
    hand:{s:"JT8",h:"A865",d:"AJ43",c:"J5"}, hcp:11,
    auction:[["מערב", "1♣"], ["צפון", "Pass"], ["מזרח", "Pass"]],
    answer:"X", expl:"בלנסינג: כפל הוצאה עם 9+ נקודות (במקום 12+) ו-3+ קלפים בכל אחת מהסדרות שטרם הוכרזו, בלי חמישייה במייג'ור. התערבות בסדרה דורשת 5+ קלפים.",
    full:"(1♣) Pass (Pass) X (Pass) 2♥ (Pass) Pass (Pass)" },
  { id:"s6b2", topic:"t8", wrong:["Pass", "X", "2♦"], dealer:"מערב", vul:"צפון-דרום", ctx:"אתה דרום (מושב רביעי). מערב פתח, צפון ומזרח עברו.", you:"דרום",
    hand:{s:"AQ9",h:"J63",d:"62",c:"KQT97"}, hcp:12,
    auction:[["מערב", "1♥"], ["צפון", "Pass"], ["מזרח", "Pass"]],
    answer:"2♣", expl:"בלנסינג: התערבות בסדרה בגובה 2 עם 9-14 נקודות (במקום 12-17). לכפל הוצאה חסרים קלפים בסדרה שטרם הוכרזה.",
    full:"(1♥) Pass (Pass) 2♣ (Pass) 2NT (Pass) 3NT (Pass) Pass (Pass)" },
  { id:"s6b3", topic:"t8", wrong:["Pass", "X", "1NT"], dealer:"מערב", vul:"מזרח-מערב", ctx:"אתה דרום (מושב רביעי). מערב פתח, צפון ומזרח עברו.", you:"דרום",
    hand:{s:"QT982",h:"Q9",d:"54",c:"K862"}, hcp:7,
    auction:[["מערב", "1♦"], ["צפון", "Pass"], ["מזרח", "Pass"]],
    answer:"1♠", expl:"בלנסינג: התערבות בסדרה בגובה 1 עם 6-14 נקודות (במקום 9-17), 5+ קלפים, ואפשר גם עם מכובד אחד.",
    full:"(1♦) Pass (Pass) 1♠ (Pass) 2♦ (Pass) 2♠ (Pass) Pass (Pass)" },
  { id:"s6b4", topic:"t8", wrong:["Pass", "X", "1♥"], dealer:"מערב", vul:"כולם", ctx:"אתה דרום (מושב רביעי). מערב פתח, צפון ומזרח עברו.", you:"דרום",
    hand:{s:"K52",h:"AQ74",d:"J5",c:"KT97"}, hcp:13,
    auction:[["מערב", "1♣"], ["צפון", "Pass"], ["מזרח", "Pass"]],
    answer:"1NT", expl:"בלנסינג: 1NT עם 11-14 נקודות (במקום 15-18), יד מאוזנת ועוצר בסדרת הפתיחה.",
    full:"(1♣) Pass (Pass) 1NT (Pass) Pass (Pass)" },
  { id:"s6r1", topic:"t9", wrong:["Pass", "4♥", "3NT"], dealer:"מערב", vul:"מזרח-מערב", ctx:"אתה צפון. התערבת ב-♥1, היריבים נעצרו בחוזה חלקי ושני פאסים באו אחריו.", you:"צפון",
    hand:{s:"Q73",h:"AKJT3",d:"7",c:"A642"}, hcp:14,
    auction:[["מערב", "1♦"], ["אתה", "1♥"], ["מזרח", "2♦"], ["דרום", "Pass"], ["מערב", "Pass"]],
    answer:"X", expl:"רה-אופנינג: היריבים נעצרו בחוזה חלקי בלי הזמנה, והנקודות מתחלקות בערך חצי-חצי, כ-20 לכל צד. מכריזים לפי הנקודות הצפויות של השותף, לא רצים לגובה.",
    full:"(1♦) 1♥ (2♦) Pass (Pass) X (Pass) 2♠ (Pass) Pass (Pass)" },
  { id:"s6r2", topic:"t9", wrong:["Pass", "4♥", "3NT"], dealer:"מערב", vul:"מזרח-מערב", ctx:"אתה צפון. מערב פתח ב-♠1, מזרח תמך ב-♠2, דרום ומערב עברו.", you:"צפון",
    hand:{s:"92",h:"KQT864",d:"6",c:"K763"}, hcp:8,
    auction:[["מערב", "1♠"], ["אתה", "Pass"], ["מזרח", "2♠"], ["דרום", "Pass"], ["מערב", "Pass"]],
    answer:"3♥", expl:"רה-אופנינג: היריבים נעצרו ב-♠2 בלי הזמנה, כך שהנקודות מתחלקות בערך חצי-חצי, כ-20 לכל צד. עם 8 נקודות מצפים מהשותף לכ-12, ומכריזים את הסדרה בלי לרוץ גבוה.",
    full:"(1♠) Pass (2♠) Pass (Pass) 3♥ (Pass) Pass (Pass)" },
  { id:"s6r3", topic:"t9", wrong:["Pass", "X", "3♥"], dealer:"מערב", vul:"כולם", ctx:"אתה דרום. מערב פתח ב-1NT, צפון ומזרח עברו. השיטה: DONT.", you:"דרום",
    hand:{s:"QJ873",h:"QJ943",d:"75",c:"T"}, hcp:6,
    auction:[["מערב", "1NT"], ["צפון", "Pass"], ["מזרח", "Pass"]],
    answer:"2♥", expl:"רה-אופנינג מול 1NT: ממשיכים להשתמש במוסכמת ההתערבות גם במושב הרביעי. ב-DONT, ♥2 מראה ♠ ו-♥, ו-X מראה יד חד-סדרתית.",
    full:"(1NT) Pass (Pass) 2♥ (Pass) Pass (Pass)" },
  { id:"s6r4", topic:"t9", wrong:["Pass", "4♦", "3NT"], dealer:"מערב", vul:"כולם", ctx:"אתה מזרח. השותף (מערב) פתח ב-♥1, צפון התערב ב-♠1, אתה עברת, דרום תמך ב-♠2, ושני פאסים באו אחריו.", you:"מזרח",
    hand:{s:"J54",h:"T",d:"AQ9762",c:"T97"}, hcp:7,
    auction:[["מערב", "1♥"], ["צפון", "1♠"], ["אתה", "Pass"], ["דרום", "2♠"], ["מערב", "Pass"], ["צפון", "Pass"]],
    answer:"3♦", expl:"רה-אופנינג: היריבים נעצרו ב-♠2 בלי הזמנה, כך שהנקודות מתחלקות בערך חצי-חצי, כ-20 לכל צד. עם סדרה ארוכה מכריזים אותה ומשלימים נקודות מהשותף.",
    full:"1♥ (1♠) Pass (2♠) Pass (Pass) 3♦ (Pass) Pass (Pass)" },
  { id:"s5b2w", topic:"t3", wrong:["2♠", "3♠", "2NT"], dealer:"מזרח", vul:"צפון-דרום", you:"מערב",
    ctx:"אתה מערב (המשיב לפותח). השותף (מזרח) פתח ב-♠1, דרום הכריז כפל הוצאה.",
    hand:{s:"96",h:"KJT4",d:"KT87",c:"AK8"}, hcp:14,
    auction:[["מזרח","1♠"],["דרום","X"]],
    answer:"XX", expl:"רידאבל מראה 10+ נקודות. עם יד מאוזנת ו-10+ נקודות מעדיפים XX כדי לקבל מידע על סדרת ההובלה הצפויה ולנסות להעניש את היריבים. בשלב הראשון XX אינו מוסר מידע נוסף על החלוקה." },
  { id:"s5b1s", topic:"t4", wrong:["2♠", "2♦", "1NT"], dealer:"צפון", vul:"ללא", you:"דרום",
    ctx:"אתה דרום (המשיב לפותח). השותף (צפון) פתח ב-♣1, מזרח הכריז כפל הוצאה.",
    hand:{s:"J9762",h:"8",d:"AJ85",c:"KQ3"}, hcp:11,
    auction:[["צפון","1♣"],["מזרח","X"]],
    answer:"1♠", expl:"סדרה חדשה בגובה 1 מראה 6+ נקודות ו-4+ קלפים. מותר להכריז כך גם עם יותר מ-10 נקודות. ביד זו יש 11 נקודות וחמישה קלפי ♠. גם XX אפשרי לפי הכללים; הוא אינו בין האפשרויות כאן." },
  { id:"s5b3n", topic:"t7", wrong:["3NT", "3♦", "2NT"], dealer:"דרום", vul:"מזרח-מערב", you:"צפון",
    ctx:"אתה צפון (המשיב לפותח). השותף (דרום) פתח ב-♦1, מערב התערב בקפיצה ב-♥2 (הכרזת מנע).",
    hand:{s:"A83",h:"T",d:"KQJT5",c:"K652"}, hcp:13,
    auction:[["דרום","1♦"],["מערב","2♥"]],
    answer:"3♥", expl:"קיו-ביד אחרי התערבות בקפיצה מראה התאמה בסדרת הפותח ו-13+ נקודות, מספיק למשחק מלא, כי הוא מחייב את השותפות לגובה גבוה. ביד זו יש 13 נקודות וחמישה קלפי ♦ לתמיכה בשותף." },
  { id:"s5b4e", topic:"t7", wrong:["3♥", "3♠", "4♣"], dealer:"מערב", vul:"כולם", you:"מזרח",
    ctx:"אתה מזרח (המשיב לפותח). השותף (מערב) פתח ב-♦1, צפון התערב בקפיצה ב-♣3 (הכרזת מנע).",
    hand:{s:"K92",h:"KJT4",d:"Q862",c:"K9"}, hcp:12,
    auction:[["מערב","1♦"],["צפון","3♣"]],
    answer:"X", expl:"כשהפותח והיריב הכריזו שתי סדרות מיינור בגובה 2 ומעלה, כפל נגטיבי מראה 4+ קלפים באחת מסדרות המייג'ור ו-8+ או 10+ נקודות, בהתאם לגובה ההתערבות. ביד זו יש רביעייה ב-♥ ו-12 נקודות." },
  { id:"s5b5s", topic:"t1", wrong:["2♥", "2♠", "2NT"], dealer:"צפון", vul:"צפון-דרום", you:"דרום",
    ctx:"אתה דרום (המשיב לפותח). השותף (צפון) פתח ב-♣1, מזרח התערב ב-♦1.",
    hand:{s:"AQ74",h:"KQ82",d:"98",c:"752"}, hcp:11,
    auction:[["צפון","1♣"],["מזרח","1♦"]],
    answer:"X", expl:"אחרי פתיחה ב-♣1 והתערבות ב-♦1, כפל נגטיבי מראה רביעיות בשתי סדרות המייג'ור. ביד זו יש ארבעה קלפי ♠, ארבעה קלפי ♥ ו-11 נקודות. גם סדרה חדשה בגובה 1 אפשרית לפי הכללים; היא אינה בין האפשרויות כאן." },
  { id:"s5b6w", topic:"t1", wrong:["2♣", "2♥", "2♦"], dealer:"מזרח", vul:"מזרח-מערב", you:"מערב",
    ctx:"אתה מערב (המשיב לפותח). השותף (מזרח) פתח ב-♣1, דרום התערב ב-♥1.",
    hand:{s:"74",h:"5",d:"J9765",c:"QJT76"}, hcp:4,
    auction:[["מזרח","1♣"],["דרום","1♥"]],
    answer:"3♣", expl:"אחרי התערבות, קפיצה בתמיכה במיינור לגובה 3 מראה יד חלשה עם 0-5 נקודות גבוהות ותמיכה של חמישה קלפים. ביד זו יש 4 נקודות וחמישה קלפי ♣. בתמיכה חלשה זו לא מוסיפים נקודות התאמה." },
  { id:"s5b7n", topic:"t5", wrong:["2♥", "2♠", "2♣"], dealer:"דרום", vul:"כולם", you:"צפון",
    ctx:"אתה צפון (המשיב לפותח). השותף (דרום) פתח ב-♣1, מערב התערב ב-1NT.",
    hand:{s:"AJ87",h:"Q852",d:"764",c:"K2"}, hcp:10,
    auction:[["דרום","1♣"],["מערב","1NT"]],
    answer:"X", expl:"אחרי שהיריב מתערב ב-1NT בפתיחת השותף, כפל הוא מעניש ומראה 10+ נקודות. ביד זו יש 10 נקודות. זה אינו כפל נגטיבי שמראה את סדרות המייג'ור." },
];

const TOPICS = [
 {
  "id": "t1",
  "icon": "1️⃣",
  "name": "ההכרזה החופשית אחרי התערבות בסדרה בגובה 1",
  "summary": [
   [
    "כללי",
    "המשיב לפותח פועל לפי סדר העדיפויות הרגיל, כאילו לא היתה התערבות. פאס חופשי: אפשר לעבור גם עם 8 נקודות, כי לפותח יש זכות דיבור נוספת."
   ],
   [
    "תמיכה בסדרת הפותח",
    "גובה 2: 6-9 נקודות. קפיצה לגובה 3: 0-5 נקודות עם תמיכה מרובה (התאמה משותפת של 9 קלפים). קיו-ביד (הכרזת סדרת ההתערבות): 10+ נקודות עם תמיכה, והפותח ממשיך כאילו למשיב יש 10-11."
   ],
   [
    "סדרה חדשה בגובה 1",
    "אחרי התערבות ♦1: 4+ קלפים ו-6+ נקודות. אחרי התערבות ♥1: ♠1 מבטיח 5+ קלפים ו-6+ נקודות."
   ],
   [
    "כפל נגטיבי",
    "6+ נקודות. עם מייג'ור אחד שלא הוכרז: 4+ קלפים בו. פותח ♥1 והיריב ♠1: הכפל מראה שני מיינורים (4+ בכל אחד). פותח ♣1 והיריב ♦1: הכפל מראה שני מייג'ורים (4+ בכל אחד)."
   ],
   [
    "סדרה חדשה בגובה 2",
    "בלי קפיצה: 5+ קלפים ו-11+ נקודות."
   ],
   [
    "הכרזות NT",
    "1NT: 6-10 נקודות עם עוצר בסדרת ההתערבות. 2NT: 11-12. 3NT: 13-15."
   ]
  ]
 },
 {
  "id": "t2",
  "icon": "2️⃣",
  "name": "ההכרזה החופשית אחרי התערבות בגובה 2",
  "summary": [
   [
    "כללי",
    "העקרונות זהים להתערבות בגובה 1, אבל הגובה עולה ולכן צריך יותר גמישות והחלטות גבוליות."
   ],
   [
    "סדרה חדשה",
    "בלי קפיצה: 5+ קלפים ו-11+ נקודות, מחייבת."
   ],
   [
    "הכרזות NT",
    "2NT: 11-12 נקודות עם עוצר בסדרת ההתערבות."
   ],
   [
    "כפל נגטיבי",
    "מראה 4+ קלפים בסדרות המייג'ור שלא הוכרזו, עם 8+ או 10+ נקודות לפי גובה ההתערבות. אחרי הכרזת מנע של היריב ופתיחה ב-♣1 הכפל מראה את שני המייג'ורים."
   ],
   [
    "הערכת יד",
    "ברידג' הוא משחק של לקיחות. יד של 5 נקודות טובות (למשל A ו-J, או KQ) מכריזים כמו עם 6."
   ]
  ]
 },
 {
  "id": "t3",
  "icon": "🔁",
  "name": "רידאבל של המשיב אחרי כפל הוצאה",
  "summary": [
   [
    "המצב",
    "הפותח הבטיח 12+ והמתערב כפל הוצאה (גם הוא 12+). נשארות לכל היותר 16 נקודות לשני האחרים, ולכן המשיב בדרך כלל חלש. עדיין לא מוותרים על משחק מלא."
   ],
   [
    "רידאבל (XX)",
    "10+ נקודות, בלי מידע נוסף בשלב הראשון. הכוונה מתגלה בסיבוב הבא: תמיכה בסדרת הפותח, סדרה של 5+ קלפים, או יד מאוזנת עם 10+."
   ],
   [
    "מה XX אומר",
    "לשותפות יש לפחות 22 נקודות. היריבים חייבים להכריז משהו, אחרת הפתיחה תישאר מוכפלת ברידאבל. כל X אחר כך, של הפותח או של המשיב, הוא כפל מעניש ומבקש פאס."
   ],
   [
    "יד מאוזנת",
    "עם 10+ נקודות ויד מאוזנת מעדיפים XX, כדי לקבל מידע על ההובלה ולנסות להעניש."
   ],
   [
    "סדרה חדשה בגובה 1",
    "6+ נקודות ו-4+ קלפים. אפשר גם עם יותר מ-10 נקודות, אף שניתן להתחיל ב-XX. עם רביעייה עשויים להעדיף להציג את הסדרה מיד, מחשש שלא יהיה אפשר להציגה בהמשך. זה אינו כלל ברזל, ויש לשפוט כל מקרה לגופו."
   ]
  ]
 },
 {
  "id": "t4",
  "icon": "🧭",
  "name": "סדרה חדשה ותמיכה בקפיצה אחרי כפל הוצאה",
  "summary": [
   [
    "המצב",
    "השותף פתח בסדרה והיריב הכריז כפל הוצאה. לסדרה חדשה בגובה 1 ולסדרה חדשה בגובה 2 יש כללים שונים."
   ],
   [
    "תמיכה בסדרת הפותח",
    "גובה 2: 6-9 נקודות. קפיצה לגובה 3: התאמה משותפת של 9 קלפים ו-0-5 נקודות גבוהות. קפיצה לגובה 4: התאמה משותפת של 10 קלפים ו-0-5 נקודות."
   ],
   [
    "סדרה חדשה בגובה 1",
    "6+ נקודות ו-4+ קלפים. מותר להכריז כך גם עם יותר מ-10 נקודות, אף שאפשר להתחיל ב-XX. עם רביעייה עשויים להעדיף להציג אותה מיד, אך זה אינו כלל ברזל."
   ],
   [
    "סדרה חדשה בגובה 2",
    "בלי קפיצה: יד חלשה, 6-9 נקודות ו-6+ קלפים בסדרה."
   ],
   [
    "הכרזות NT",
    "1NT: 6-10 נקודות, בלי חובת איזון. 2NT: 11-12 מאוזנת. 3NT: 13-15 מאוזנת. אין חובת עוצר, כי אין סדרה מסוימת שהיריבים יתקפו בה."
   ],
   [
    "פאס",
    "אפשר לעבור גם עם 7-8 נקודות כשאין הכרזה מתאימה, כי לפותח יש זכות דיבור נוספת."
   ]
  ]
 },
 {
  "id": "t5",
  "icon": "🅽",
  "name": "תגובה אחרי התערבות 1NT בפתיחת השותף",
  "summary": [
   [
    "המצב",
    "השותף פתח והיריב התערב ב-1NT. המטרה כבר לא משחק מלא אלא להעניש את המתנגד או לגנוב משחק חלקי. לפני כל החלטה בודקים פגיעות."
   ],
   [
    "כפל (X)",
    "מעניש, 10+ נקודות."
   ],
   [
    "תמיכה בסדרת הפותח",
    "גובה 2: 6-9 נקודות ו-3 קלפים. גובה 3: 0-5 נקודות ו-4 קלפים (9 שליטים יחד), יד לא מאוזנת, עדיף כשלא פגיע. אין קיו-ביד: במקומו נותנים X."
   ],
   [
    "סדרה חדשה בגובה 2",
    "6+ קלפים ועד 6-9 נקודות. הכרזה סוגרת (off sign)."
   ],
   [
    "ניקוד",
    "חוזה של ♥2 מקבל פחות ניקוד מהפלה של 1NT מוכפל במצב פגיע."
   ]
  ]
 },
 {
  "id": "t6",
  "icon": "🛡️",
  "name": "תגובה לשותף שהתערב ב-1NT",
  "summary": [
   [
    "המצב",
    "השותף התערב ב-1NT. אתה המשיב, והיריב מימין הכריז."
   ],
   [
    "אחרי כפל של היריב",
    "המשיב חלש מנסה להגיע לחוזה בשליט בגובה 2. התאמה של 7 קלפים מספיקה, ומנסים לא להיתקע עם 6 שליטים. כל הכרזת סדרה היא טרנספר (♣2 מעביר ל-♦ וכו'). XX: טרנספר ל-♣. Pass: טרנספר לרידאבל כשאין חמישייה, ומשם מתחיל שיח רביעיות מלמטה."
   ],
   [
    "אחרי הכרזת סדרה של היריב",
    "הטרנספרים וסטיימן מבוטלים. 3NT: 9+ עם עוצר. סדרה בגובה 2: סוגרת, עד 8 נקודות, 5+ קלפים. סדרה בגובה 3: מחייבת למשחק, 9+ נקודות, 5 קלפים. סדרה בגובה 4: 9+ נקודות ו-6 קלפים. Pass אפשרי."
   ],
   [
    "כפל וקיו-ביד",
    "X: מעניש, 4+ קלפים בסדרת היריב ו-7+ נקודות. קיו-ביד (הכרזת סדרת היריב): מחייב למשחק, 9+ נקודות, שואל על המייג'ור השני כמו סטיימן."
   ]
  ]
 },
 {
  "id": "t7",
  "icon": "🚧",
  "name": "ההכרזה החופשית אחרי התערבות בקפיצה (הכרזת מנע)",
  "summary": [
   [
    "המצב",
    "היריב מתערב בסדרה בקפיצה: סדרה ארוכה ויד חלשה עם 6-9 נקודות. העקרונות זהים לשאר החלקים, אבל יש פחות מרחב מכרז ולכן החלטות קשות יותר."
   ],
   [
    "כפל נגטיבי",
    "מראה 4+ קלפים בסדרות המייג'ור שלא הוכרזו, עם 8+ או 10+ נקודות לפי גובה ההתערבות. אחרי הכרזת מנע של היריב ופתיחה ב-♣1 הכפל מראה את שני המייג'ורים."
   ],
   [
    "קיו-ביד",
    "אחרי התערבות בקפיצה הקיו-ביד מחייב את השותפות לגובה גבוה מאוד. לכן הוא מראה התאמה בסדרת הפותח ו-13+ נקודות, מספיק למשחק מלא."
   ],
   [
    "תמיכה בלי קפיצה",
    "עם 10-12 נקודות ותמיכה: תמיכה בגובה 3 בלי קפיצה (למשל ♥3), יד מזמינה."
   ],
   [
    "הערכת יד",
    "ברידג' הוא משחק של לקיחות ולא של נקודות. יד של 5 נקודות טובות (למשל A ו-J, או KQ, או חמישייה עם 2 מכובדים) מכריזים כמו עם 6."
   ],
   [
    "נקודות התאמה",
    "לא סופרים נקודות התאמה כשיש התאמה במיינור, כי רוצים לשחק NT. רק אם מחליטים על משחק מלא במיינור, מחשבים אותן."
   ]
  ]
 },
 {
  "id": "t8",
  "icon": "⚖️",
  "name": "בלנסינג (מושב רביעי)",
  "summary": [
   [
    "המצב",
    "היריב פתח בגובה 1 ואחריו באו 2 פאסים, ותורנו להכריז. הפותח הבטיח 12 נקודות והמשיב מוגבל ב-5, אז לשותף שלנו ייתכנו נקודות שלא יכל להתערב איתן. לשותפות יכולות להיות אפילו 28 נקודות ומשחק מלא."
   ],
   [
    "הכללים",
    "מכריזים לפי כללי ההתערבות הרגילים, עם הנחה של כ-3 נקודות ועם חובת מכובדים מופחתת."
   ],
   [
    "התערבות בגובה 1",
    "רגיל: 9-17 נקודות, 5+ קלפים, 2 מכובדים. בלנסינג: 6-14 נקודות, אפשר גם עם מכובד אחד."
   ],
   [
    "התערבות בגובה 2",
    "רגיל: 12-17 נקודות. בלנסינג: 9-14 נקודות."
   ],
   [
    "כפל הוצאה",
    "רגיל: 12+ נקודות, 3+ קלפים בכל אחת מהסדרות שטרם הוכרזו, בלי חמישייה במייג'ור. בלנסינג: 9+ נקודות."
   ],
   [
    "1NT",
    "רגיל: 15-18 נקודות, יד מאוזנת, עוצר בסדרת הפתיחה. בלנסינג: 11-14 נקודות."
   ],
   [
    "כפל גדול (Double Big)",
    "יד חזקה מדי להתערבות רגילה, בדרך כלל 18+ נקודות, בכל מיני חלוקות. בלנסינג: 15+ נקודות."
   ],
   [
    "המשיב לבלנסינג",
    "ההתערבות יכולה להיות חלשה ב-3 נקודות ומוגבלת ב-14, לכן מכריזים בזהירות. אחרי כפל הוצאה של השותף מרחיבים את הטווחים של המשיב ב-3 נקודות (חלש/בינוני/חזק). אחרי 1NT של השותף (11-14): סטיימן דורש 11+ (במקום 8+), משחק מלא ב-3NT או במייג'ור דורש 14+, וטרנספר נשאר עם 0+ אבל להזמין צריך 11+."
   ]
  ]
 },
 {
  "id": "t9",
  "icon": "🔓",
  "name": "רה-אופנינג (פתיחת המכרז מחדש)",
  "summary": [
   [
    "המצב",
    "היריבים השתתפו במכרז, הוכרזו 2 פאסים ותורנו. אם נעבור, המכרז יסתיים. הכוונה למצב שבו היריבים נעצרו בחוזה חלקי בלי הזמנה: 1NT או 2♣/2♦/2♥/2♠."
   ],
   [
    "ההיגיון",
    "אף אחד מהיריבים לא הזמין למשחק מלא, ולכן שניהם חלשים בטווח שלהם. הנקודות כנראה מתחלקות חצי-חצי, כ-20 נקודות לכל צד, ולכן אפשר לדעת כמה השותף צפוי להביא: עם 12 נקודות כ-8, עם 7 נקודות כ-13."
   ],
   [
    "דגשים",
    "מכריזים גם את הנקודות של השותף ולא רצים קדימה. לא מכריזים עם כל יד, ולוקחים בחשבון פגיעות: כשלא פגיעים אפשר להיות אגרסיביים יותר. חשוב לעמוד בתנאי החלוקה של ההכרזה, כי את הנקודות משלימים מהשותף."
   ],
   [
    "מטרות",
    "לבצע את החוזה שהכרזנו, ליפול בחוזה שיעלה פחות מביצוע של היריבים, או שהיריבים ימשיכו להכריז ואולי לא יעמדו בחוזה."
   ],
   [
    "היריבים פתחו 1NT",
    "לא סביר שיש לנו 25 נקודות, לכן לא מחפשים משחק מלא. הפותח מוגבל ב-15-17 והמשיב לא הזמין, אז הנקודות חצי-חצי וניתן להתערב לפי הנקודות של השותף. אם יש לנו מוסכמה להתערבות אחרי 1NT (למשל DONT), ממשיכים להשתמש בה גם במושב הרביעי, עם הקלה מסוימת בנקודות."
   ],
   [
    "היריבים פתחו פתיחה חלשה בגובה 2 או 3",
    "הפותח מראה 6-9 נקודות, והמשיב יכול להיות חזק ולהגיד פאס כי הפותח מוגבל. מתערבים לפי הכללים הרגילים ובזהירות, בלי הנחות מיוחדות."
   ]
  ]
 }
];
const topicOf = id => TOPICS.find(t => t.id === id);
const GROUPS = [{ id:"g1", icon:"🏆", name:"המכרז התחרותי", topics:["t1","t2","t7","t3","t4","t5","t6","t8","t9"] }];
const groupOf = id => GROUPS.find(g => g.id === id);
const groupedIds = GROUPS.reduce((a, g) => a.concat(g.topics), []);
const qsOfGroup = g => QUESTIONS.filter(x => g.topics.includes(x.topic));
const qsOf = id => QUESTIONS.filter(x => x.topic === id);

/* ---------- helpers ---------- */
function spaced(cards){ return cards.split("").map(ch => ch === "T" ? "10" : ch).join(" "); }
function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function loadStats(){
  try { const s = JSON.parse(localStorage.getItem("bm-stats-v1")); if (s && typeof s === "object") return s; } catch(e){}
  return { answered: {}, totalAnswers: 0, totalCorrect: 0 };
}
function saveStats(s){ try { localStorage.setItem("bm-stats-v1", JSON.stringify(s)); } catch(e){} }

const SUITS = [["♣","black"],["♦","red"],["♥","red"],["♠","black"]];

/* ---------- small components ---------- */
function Bid({b}) {
  if (!b) return null;
  const suit = b.slice(-1);
  const red = suit === "♥" || suit === "♦";
  return <span className={"bid" + (red ? " red" : "")} dir="ltr">{b}</span>;
}

function HandView({hand, hcp}) {
  return (
    <div className="hand" dir="ltr">
      <div><span className="suit">♠</span> {spaced(hand.s)}</div>
      <div><span className="suit red">♥</span> {spaced(hand.h)}</div>
      <div><span className="suit red">♦</span> {spaced(hand.d)}</div>
      <div><span className="suit">♣</span> {spaced(hand.c)}</div>
      <div className="hcp" dir="rtl">{hcp} נק'</div>
    </div>
  );
}

function AuctionLine({auction}) {
  return (
    <div className="auction auc-flex" dir="ltr">
      {auction.map(([who, bid], i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="auc-sep">·</span>}
          <span className="auc-item" dir="rtl">{who}: <Bid b={bid}/></span>
        </React.Fragment>
      ))}
      <span className="auc-sep">·</span>
      <span className="auc-you" dir="rtl">אתה: ?</span>
    </div>
  );
}

function BidPad({options, selected, onSelect}) {
  return (
    <div className="opts" dir="ltr">
      {options.map(o => (
        <button key={o} className={"opt-btn" + (selected === o ? " sel" : "")} onClick={() => onSelect(o)}><Bid b={o}/></button>
      ))}
    </div>
  );
}

function FullAuction({text, you}) {
  const calls = text.split(/\s+/).filter(Boolean).map(t => t.replace(/[()]/g, ""));
  const seats = ["מערב", "צפון", "מזרח", "דרום"];
  const rows = [];
  for (let i = 0; i < calls.length; i += 4) rows.push(calls.slice(i, i + 4));
  return (
    <div className="atab" dir="ltr">
      {seats.map(x => <div key={x} className={"ah" + (x === (you || "מזרח") ? " you" : "")} dir="rtl">{x}</div>)}
      {rows.map((r, ri) => [0, 1, 2, 3].map(ci => (
        <div key={ri + "-" + ci} className={"ac" + (seats[ci] === (you || "מזרח") ? " you" : "")}>{r[ci] ? <Bid b={r[ci]}/> : ""}</div>
      )))}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err){ return { err }; }
  render(){
    if (this.state.err) return <ErrorScreen onRetry={() => this.setState({ err: null })} onHome={this.props.onHome}/>;
    return this.props.children;
  }
}

function ReportIssue({settings = false}) {
  const [showHelp, setShowHelp] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const mailto = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("BRIDGE-MENTOR: דיווח על בעיה") + "&body=" + encodeURIComponent("גרסה: " + VERSION + "\n\nתיאור הבעיה:\n");
  async function copyAddress() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(EMAIL);
      setCopyStatus("הכתובת הועתקה");
    } catch {
      setCopyStatus("לא ניתן להעתיק אוטומטית. אפשר לסמן ולהעתיק את הכתובת למעלה.");
    }
  }
  return <div>
    <a className={settings ? "setrow link" : "report"} href={mailto} target="_blank" rel="noopener noreferrer" onClick={() => setShowHelp(true)}>
      {settings ? <><span>דיווח על בעיה</span><span className="setval">✉</span></> : <>דיווח על בעיה: {EMAIL}</>}
    </a>
    {showHelp && <div className="report-help" role="region" aria-label="דיווח על בעיה">
      <p>אם אפליקציית המייל לא נפתחה, אפשר להעתיק את הכתובת ולפתוח הודעה חדשה במייל.</p>
      <input className="report-address" aria-label="כתובת לדיווח" readOnly value={EMAIL} dir="ltr" onFocus={e => e.target.select()} />
      <button className="secondary" onClick={copyAddress}>העתקת הכתובת</button>
      <a className="secondary report-retry" href={mailto} target="_blank" rel="noopener noreferrer">פתיחת הודעה במייל</a>
      <p className="report-status" role="status">{copyStatus}</p>
      <p className="report-note">השליחה מתבצעת רק מתוך אפליקציית המייל, לאחר בדיקת ההודעה.</p>
    </div>}
  </div>;
}

function ErrorScreen({onRetry, onHome}) {
  return (
    <div className="content">
      <div className="card center-card">
        <div className="err-emoji">⚠️</div>
        <div className="err-title">השאלה לא נטענה</div>
        <div className="expl">אירעה שגיאה טכנית. בדוק את החיבור ונסה שוב.</div>
        <button className="primary" onClick={onRetry}>נסה שוב</button>
        <button className="secondary" onClick={onHome}>חזרה לבחירת נושא</button>
        <ReportIssue/>
      </div>
    </div>
  );
}

/* ---------- main app ---------- */
export default function Mentor({ stats, setStats, users, current, selectUser }){
  const [nameInput, setNameInput] = useState("");
  const [screen, setScreen] = useState(current ? "home" : "players"); // home | topics | question | feedback | summary | stats | settings | done | error
  const [order, setOrder] = useState(() => QUESTIONS.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState(null);
  const [fb, setFb] = useState(null); // {bid, ok}
  const [tid, setTid] = useState(null);
  const [grp, setGrp] = useState(null);
  const backList = () => setScreen(grp ? "group" : "topics");
  const TopicRow = ({t}) => {
    const qs = qsOf(t.id);
    const done = qs.filter(x => stats.answered[x.id]).length;
    return (
      <div className="topicrow" onClick={() => startTopic(t.id)}>
        <span className="em">{t.icon}</span>
        <span className="name">{t.name}<small className="tsub">{qs.length} {qs.length === 1 ? "שאלה" : "שאלות"}</small></span>
        <button className="tsum" onClick={e => { e.stopPropagation(); setSumTid(t.id); setScreen("summary"); }}>תקציר</button>
        <span className="pct">{Math.round(100 * done / qs.length)}%</span>
      </div>
    );
  };
  const [sumTid, setSumTid] = useState(TOPICS[0].id);
  const curName = tid ? (groupOf(tid) ? groupOf(tid).name : topicOf(tid).name) : "כל הנושאים";

  // Demo / deep links for development previews: #topics #question #correct #wrong #summary #stats #settings #done #error
  useEffect(() => {
    const h = (window.location.hash || "").replace("#", "");
    if (!h) return;
    if (h === "correct" || h === "wrong"){
      setOrder(QUESTIONS.map((_, i) => i)); setPos(0);
      setFb({ bid: h === "correct" ? QUESTIONS[0].answer : "Pass", ok: h === "correct" });
      setScreen("feedback");
    } else if (h === "group"){
      setGrp("g1"); setScreen("group");
    } else if (["topics","question","summary","stats","settings","done","error","home"].includes(h)){
      if (h === "question"){ setOrder(QUESTIONS.map((_, i) => i)); setPos(0); setSelected(null); }
      setScreen(h);
    }
  }, []);

  const q = QUESTIONS[order[pos]];
  const options = useMemo(() => q ? shuffle([q.answer, ...q.wrong]) : [], [q && q.id, pos, order]);
  const uniqueAnswered = Object.keys(stats.answered).length;
  const pct = uniqueAnswered ? Math.round(100 * (stats.answered && Object.values(stats.answered).filter(a => a.correct).length) / QUESTIONS.length) : 0;

  function startTopic(id){
    const t = id === undefined ? tid : id;
    setTid(t);
    setOrder(shuffle(QUESTIONS.map((x, i) => (!t || x.topic === t || (groupOf(t) && groupOf(t).topics.includes(x.topic))) ? i : -1).filter(i => i >= 0)).slice(0, 10));
    setPos(0); setSelected(null); setFb(null); setScreen("question");
  }
  function check(){
    if (!selected) return;
    let ok;
    try {
      if (!q) throw new Error("question missing");
      ok = selected === q.answer;
    } catch(e){ setScreen("error"); return; }
    setFb({ bid: selected, ok });
    const ns = { ...stats, totalAnswers: stats.totalAnswers + 1, totalCorrect: stats.totalCorrect + (ok ? 1 : 0),
      answered: { ...stats.answered, [q.id]: { correct: ok } } };
    setStats(ns);
    setScreen("feedback");
  }
  function next(){
    if (pos + 1 >= order.length){ setScreen("done"); return; }
    setPos(pos + 1); setSelected(null); setFb(null); setScreen("question");
  }

  return (
    <ErrorBoundary onHome={() => setScreen("topics")}>
      <div className="app" dir="rtl">

        {screen === "home" && (
          <>
            <div className="header"><h1>🌉 BRIDGE-MENTOR</h1><div className="sub">המאמן האישי שלך לברידג' · שיטת SAYC</div></div>
            <div className="content">
              <button className="chip" onClick={() => setScreen("players")}>👤 {current} · החלפת שם</button>
              <button className="bigbtn" onClick={() => { setGrp(null); setScreen("topics"); }}><span className="em">🎯</span><span>תרגול לפי נושא<small>נושאים ממוקדים ותקצירי תיאוריה</small></span></button>
              <button className="bigbtn" onClick={() => setScreen("stats")}><span className="em">📊</span><span>הסטטיסטיקה שלי<small>התקדמות לפי נושאים</small></span></button>
              <button className="bigbtn" onClick={() => setScreen("settings")}><span className="em">⚙️</span><span>הגדרות<small>גרסה ויצירת קשר</small></span></button>
            </div>
            <div className="foot">גרסה {VERSION} · Developed by Avi Berger</div>
          </>
        )}

        {screen === "players" && (
          <>
            <div className="header"><div className="navbar">{current && <span className="back" onClick={() => setScreen("home")}>→</span>}<h1>מי מתרגל?</h1></div></div>
            <div className="content">
              <div className="card">
                <h2>שם חדש</h2>
                <input className="nameinput" value={nameInput} maxLength={20} placeholder="הקלד שם" onChange={e => setNameInput(e.target.value)} />
                <button className={"primary" + (nameInput.trim() ? "" : " disabled")} onClick={() => { if (nameInput.trim()){ selectUser(nameInput); setNameInput(""); setScreen("home"); } }}>המשך</button>
              </div>
              {Object.keys(users).length > 0 && <div className="card">
                <h2>שמות קיימים</h2>
                {Object.keys(users).map(n => (
                  <button key={n} className={"secondary" + (n === current ? " cur" : "")} onClick={() => { selectUser(n); setScreen("home"); }}>{n}{n === current ? " ✓" : ""}</button>
                ))}
              </div>}
              <div className="expl" style={{fontSize:13}}>הסטטיסטיקה נשמרת על המכשיר הזה, לפי שם.</div>
            </div>
          </>
        )}

        {screen === "group" && grp && (
          <>
            <div className="header"><div className="navbar"><span className="back" onClick={() => { setGrp(null); setScreen("topics"); }}>→</span><h1>{groupOf(grp).name}</h1></div></div>
            <div className="content">
              {groupOf(grp).topics.map(id => <TopicRow key={id} t={topicOf(id)}/>)}
              <div className="topicrow" onClick={() => startTopic(grp)}>
                <span className="em">🎲</span>
                <span className="name">כל נושאי המכרז התחרותי, בסדר אקראי<small className="tsub">10 מתוך {qsOfGroup(groupOf(grp)).length} שאלות</small></span>
              </div>
            </div>
          </>
        )}

        {screen === "topics" && (
          <>
            <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>בחירת נושא</h1></div></div>
            <div className="content">
              {GROUPS.map(g => {
                const qs = qsOfGroup(g);
                const done = qs.filter(x => stats.answered[x.id]).length;
                return (
                  <div className="topicrow" key={g.id} onClick={() => { setGrp(g.id); setScreen("group"); }}>
                    <span className="em">{g.icon}</span>
                    <span className="name">{g.name}<small className="tsub">{g.topics.length} נושאים · {qs.length} שאלות</small></span>
                    <span className="pct">{Math.round(100 * done / qs.length)}%</span>
                    <span className="chev">‹</span>
                  </div>
                );
              })}
              {TOPICS.filter(t => !groupedIds.includes(t.id)).map(t => <TopicRow key={t.id} t={t}/>)}
              <div className="topicrow" onClick={() => startTopic(null)}>
                <span className="em">🎲</span>
                <span className="name">כל השאלות, בסדר אקראי<small className="tsub">10 מתוך {QUESTIONS.length} שאלות</small></span>
                <span className="pct">{Math.round(100 * uniqueAnswered / QUESTIONS.length)}%</span>
              </div>
            </div>
          </>
        )}

        {screen === "question" && q && (
          <>
            <div className="header"><div className="navbar"><span className="back" onClick={backList}>→</span><h1 className="tname">{curName}</h1><span className="counter">שאלה {pos + 1} מתוך {order.length}</span><button className="tsum" onClick={() => { setSumTid(q.topic); setScreen("summary"); }}>תקציר</button></div></div>
            <div className="content scroll">
              <div className="card">
                <h2>היד שלך</h2>
                <HandView hand={q.hand} hcp={q.hcp}/>
              </div>
              <div className="card">
                <h2>המכרז</h2>
                <AuctionLine auction={q.auction}/>
                <div className="ctx">{q.ctx}{q.dealer ? " · דילר: " + q.dealer : ""}{q.vul ? " · פגיעים: " + q.vul : ""}</div>
              </div>
              <div className="q">מה תכריז?</div>
              <BidPad options={options} selected={selected} onSelect={setSelected}/>
              <div className="selbar">
                <span>בחרת: <Bid b={selected}/></span>
                <button className={"check" + (selected ? "" : " disabled")} onClick={check}>בדיקה ✓</button>
              </div>
            </div>
          </>
        )}

        {screen === "feedback" && q && fb && (
          <>
            <div className="header"><div className="navbar"><span className="back" onClick={backList}>→</span><h1 className="tname">{curName}</h1><span className="counter">שאלה {pos + 1} מתוך {order.length}</span></div></div>
            <div className="content scroll">
              <div className={fb.ok ? "banner-ok" : "banner-bad"}>{fb.ok ? "נכון! ✅" : "לא נכון ❌"}</div>
              <div className="card">
                <div className="ansrow"><span>ההכרזה שלך:</span> <Bid b={fb.bid}/></div>
                {!fb.ok && <div className="ansrow"><span>התשובה הנכונה:</span> <Bid b={q.answer}/></div>}
                <h2>הסבר</h2>
                <div className="expl"><Bid b={q.answer}/> · {q.expl}</div>
                {q.full && (<>
                  <h2 style={{marginTop:12}}>המכרז המלא</h2>
                  <FullAuction text={q.full} you={q.you}/>
                </>)}
              </div>
              <button className="primary" onClick={next}>{pos + 1 >= order.length ? "סיום הסיבוב" : "שאלה הבאה"}</button>
              <button className="secondary" onClick={() => { setSumTid(q.topic); setScreen("summary"); }}>תקציר הנושא</button>
            </div>
          </>
        )}

        {screen === "done" && (
          <>
            <div className="header"><h1>כל הכבוד! 🏆</h1><div className="sub">סיימת את כל השאלות בנושא</div></div>
            <div className="content">
              <SummaryCards stats={stats} total={QUESTIONS.length}/>
              <button className="primary" onClick={() => startTopic()}>סיבוב נוסף (סדר אקראי חדש)</button>
              <button className="secondary" onClick={backList}>חזרה לבחירת נושא</button>
            </div>
          </>
        )}

        {screen === "summary" && (
          <>
            <div className="header"><div className="navbar"><span className="back" onClick={backList}>→</span><h1>סיכום נושא</h1></div></div>
            <div className="content">
              <div className="card"><h2>{topicOf(sumTid).icon} {topicOf(sumTid).name}</h2>
                {topicOf(sumTid).summary.map(([h, t], i) => (
                  <div className="sumitem" key={i}><div className="sumh">{h}</div><div className="expl">{t}</div></div>
                ))}
              </div>
              <SummaryCards stats={{ answered: Object.fromEntries(qsOf(sumTid).filter(x => stats.answered[x.id]).map(x => [x.id, stats.answered[x.id]])), totalAnswers: 0, totalCorrect: 0 }} total={qsOf(sumTid).length} hidePct/>
              <button className="primary" onClick={() => startTopic(sumTid)}>תרגול הנושא</button>
            </div>
          </>
        )}

        {screen === "stats" && (
          <>
            <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>{"הסטטיסטיקה של " + current}</h1></div></div>
            <div className="content">
              <SummaryCards stats={stats} total={QUESTIONS.length}/>
              {[...GROUPS.map(g => ({ g, list: g.topics.map(topicOf) })), ...TOPICS.filter(t => !groupedIds.includes(t.id)).map(t => ({ g: null, list: [t] }))].map((blk, bi) => {
                const row = (t, key) => {
                  const qs = qsOf(t.id);
                  const done = qs.filter(x => stats.answered[x.id]).length;
                  const ok = qs.filter(x => stats.answered[x.id] && stats.answered[x.id].correct).length;
                  return (
                    <div className="bar-row" key={key}>
                      <div className="ttl"><span className="ico">{t.icon}</span><span className="tn">{t.name}</span></div>
                      <div className="meter"><div className="bar"><div style={{width: Math.round(100 * done / qs.length) + "%"}}></div></div><span className="cnt">{done}/{qs.length} נענו · {ok} נכון</span></div>
                    </div>
                  );
                };
                if (!blk.g) return row(blk.list[0], "o" + bi);
                const gq = qsOfGroup(blk.g);
                const gd = gq.filter(x => stats.answered[x.id]).length;
                const gk = gq.filter(x => stats.answered[x.id] && stats.answered[x.id].correct).length;
                return (
                  <div key={blk.g.id}>
                    <div className="gtitle"><span>{blk.g.icon} {blk.g.name}</span><span className="cnt">{gd}/{gq.length} נענו · {gk} נכון</span></div>
                    {blk.list.map(t => row(t, t.id))}
                  </div>
                );
              })}
              {Object.keys(users).length > 1 && <div className="card">
                <h2>כל השמות במכשיר</h2>
                {Object.entries(users).map(([n, u]) => {
                  const a = Object.keys(u.answered || {}).length;
                  const c = Object.values(u.answered || {}).filter(x => x.correct).length;
                  return <div className="setrow" key={n}><span>{n}</span><span className="setval">{a}/{QUESTIONS.length} נענו · {c} נכון</span></div>;
                })}
              </div>}
            </div>
          </>
        )}

        {screen === "settings" && (
          <>
            <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>הגדרות</h1></div></div>
            <div className="content">
              <div className="setrow"><span>שיטת הכרזות</span><span className="setval">SAYC</span></div>
              <div className="setrow"><span>גרסה</span><span className="setval">{VERSION}</span></div>
              <ReportIssue settings/>
              <div className="about">
                <div className="dev">Developed by Avi Berger</div>
                <div>{EMAIL}</div>
              </div>
            </div>
          </>
        )}

        {screen === "error" && (
          <ErrorScreen onRetry={() => setScreen("question")} onHome={() => setScreen("topics")}/>
        )}

      </div>
    </ErrorBoundary>
  );
}

function SummaryCards({stats, total, hidePct}){
  const uniqueAnswered = Object.keys(stats.answered).length;
  const correctUnique = Object.values(stats.answered).filter(a => a.correct).length;
  const pct = stats.totalAnswers ? Math.round(100 * stats.totalCorrect / stats.totalAnswers) : 0;
  return (
    <div className="statbig">
      <div className="statbox"><div className="n">{uniqueAnswered}/{total}</div><div className="l">שאלות נענו</div></div>
      <div className="statbox"><div className="n">{correctUnique}</div><div className="l">תשובות נכונות</div></div>
      <div className="statbox"><div className="n">{hidePct ? (uniqueAnswered ? Math.round(100 * correctUnique / uniqueAnswered) : 0) : pct}%</div><div className="l">אחוז הצלחה</div></div>
    </div>
  );
}

