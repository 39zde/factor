const TitleRx = new RegExp(
	'^(?<title>(?<start>^[hHmMFfDd])(?<afterStart>((?<=[Hh])e?r{1,2}.?)|((?<=[Ff])ra?u?.?)|((?<=[Mm])(((iste)?r)|(is)?s).?)|((?<=[Dd])(octo)?r.?)))s?(?<doctorTitle>([dD](octo)?r.?s{0,3}((([mM]ed.?)|([jJ]ur.?)|([Dd]ent.?))s{0,3}){0,2}){1,3})?(?<diploma>(([dD]ipl(oma?)?.?)(-?s{0,2}?((Ing)|(Kf[mr])).?)|([BM].[ABCEMPST]{1}((omp|hem|ath|ci?|hil|con|ech|cc|rim).)?)){0,2}|([mM]ag.))?[W]?$',
	'gm'
);

const titleTitleRx =
	/(?<title>(?<start>^[hHmMFfDd])(?<afterStart>((?<=[Hh])e?rr?\.?)|((?<=[Ff])ra?u?\.?)|((?<=[Mm])(((iste)?r)|(is)?s)\.?)|((?<=[Dd])(octo)?r\.?)))/gm;
const doctorRx =
	/(?<doctorTitle>([dD](octo)?r\.?\s{0,3}((([mM]ed\.?)|([jJ]ur\.?)|([Dd]ent\.?))\s{0,3}){0,2}){1,3})/gm;
const diplomaRx =
	/(?<diploma>(([dD]ipl(oma?)?\.?)(\-?\s{0,2}?((Ing)|(Kf[mr]))\.?)|([BM]\.[ABCEMPST]{1}((omp|hem|ath|ci?|hil|con|ech|cc|rim)\.)?)){0,2}|([mM]ag\.))/gm;

// match any white space coming after a preceding whitespace | match any white space at the start of the string | match any tailing white spaces at the end of the string
const WhiteSpaceRx = /(((?<=\s)\s+)|(^\s+)|(\s+$))/gm;

const EmailRx =
	/(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})/i;

export const rx = {
	TitleRx,
	WhiteSpaceRx,
	EmailRx,
	titleTitleRx,
	doctorRx,
	diplomaRx,
};
