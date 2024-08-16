const TitleRx = new RegExp(
	'^(?<title>(?<start>^[hHmMFfDd])(?<afterStart>((?<=[Hh])e?r{1,2}.?)|((?<=[Ff])ra?u?.?)|((?<=[Mm])(((iste)?r)|(is)?s).?)|((?<=[Dd])(octo)?r.?)))s?(?<doctorTitle>([dD](octo)?r.?s{0,3}((([mM]ed.?)|([jJ]ur.?)|([Dd]ent.?))s{0,3}){0,2}){1,3})?(?<diploma>(([dD]ipl(oma?)?.?)(-?s{0,2}?((Ing)|(Kf[mr])).?)|([BM].[ABCEMPST]{1}((omp|hem|ath|ci?|hil|con|ech|cc|rim).)?)){0,2}|([mM]ag.))?[W]?$',
	'gm'
);


export const rx = {
	TitleRx
}
