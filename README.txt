BRIDGE-MENTOR 1.2.5 - reorganized source + built index.html (open index.html in a browser).
index.html                    self-contained build
build-instructions.txt           how to rebuild index.html from src/
src/bridge-mentor-entry.jsx   entry point (stats bm-stats-v2 and topic selection bm-topics-v1 in localStorage)
src/mentor/Mentor.jsx         app state and screen routing
src/mentor/screens/           one file per screen
src/mentor/components/        shared components
src/mentor/data/              g01..g12 = one file per main topic (questions + subtopics); groups.jsx; index.jsx
src/mentor/lib/helpers.jsx, config.jsx (VERSION, EMAIL), mentor.css
