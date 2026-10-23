import * as g01 from './g01-competitive-auction.jsx';
import * as g02 from './g02-major-support.jsx';
import * as g03 from './g03-1nt-conventions.jsx';
import * as g04 from './g04-advanced-doubles.jsx';
import * as g05 from './g05-michaels-cue-bid.jsx';
import * as g06 from './g06-finding-fits.jsx';
import * as g07 from './g07-sacrifice-and-competition.jsx';
import * as g08 from './g08-minors.jsx';
import * as g09 from './g09-slams.jsx';
import * as g10 from './g10-auction-problems.jsx';
import * as g11 from './g11-declarer-play.jsx';
import * as g12 from './g12-defense.jsx';
import { GROUPS } from './groups.jsx';

export { GROUPS };
const parts = [g01, g02, g03, g04, g05, g06, g07, g08, g09, g10, g11, g12];
export const QUESTIONS = parts.flatMap(p => p.questions);
export const TOPICS = parts.flatMap(p => p.topics);
export const PLAY_TOPICS = { t47:1, t48:1, t49:1, t50:1, t51:1, t52:1 };

export const topicOf = id => TOPICS.find(t => t.id === id);
export const groupOf = id => GROUPS.find(g => g.id === id);
export const groupedIds = GROUPS.reduce((a, g) => a.concat(g.topics), []);
export const qsOfGroup = g => QUESTIONS.filter(x => g.topics.includes(x.topic));
export const qsOf = id => QUESTIONS.filter(x => x.topic === id);
