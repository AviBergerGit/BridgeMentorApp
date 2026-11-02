BRIDGE-MENTOR 1.3.2 - כל קבצי הפרויקט
=====================================
חדש ב-1.3.2: ניהול משתמשים מאובטח עם סיסמת מנהל (הגדרות > ניהול משתמשים).

מה יש כאן:
- index.html        הגירסה המוכנה להפעלה: מחלצים ופותחים בדפדפן.
- src/              קוד המקור המלא (React/JSX):
    src/mentor/data/     מאגר השאלות, קובץ נפרד לכל נושא-על (12 נושאים, 600 שאלות)
    src/mentor/screens/  מסכי האפליקציה
    src/mentor/components/ רכיבים משותפים
    src/mentor/lib/      עזר וסנכרון ענן (sync.js)
    src/mentor/config.js מספר גירסה והגדרות סנכרון
- supabase/         סקריפטי SQL להקמת בסיס הנתונים של סנכרון הענן
- entry.html, package.json, vite.config.js, build.sh, src/shim-files.ts
                    קבצי בנייה ליצירת index.html מהמקור
- file.json         הצהרת כתובת השרת (Supabase) עבור הקישור המתארח

בנייה מחדש של index.html מהמקור (דורש Node.js):
    ./build.sh
    (או: npm install ואז npm run build - התוצאה ב-dist/entry.html)

הערות:
- האפליקציה עובדת גם בלי שרת; סנכרון הענן פעיל מול פרויקט Supabase הקיים.
- מפתח ה-Supabase שבקוד הוא מפתח anon ציבורי בלבד (נמצא גם בקובץ המופעל).
