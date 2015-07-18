import Q from 'q';
import git from 'git';
import fs from 'fs';
const fil = __dirname + '/main.js';

const openRepo = Q.denodeify( ( ...args ) => new git.Repo( ...args ) );
function dt ( { yr, mo, dy, hr, min, sec } ) {
	const d = new Date();
	d.setFullYear( yr );
	d.setMonth( mo - 1 );
	d.setDate( dy );
	d.setHours( hr );
	d.setMinutes( min );
	d.setSeconds( sec );
	return d;
}
function makeCommit ( repo, date ) {
	const isodate = date.toISOString();
	fs.appendFileSync( fil, `\n// ${ isodate }` );
	process.env.GIT_AUTHOR_DATE = process.env.GIT_COMMITTER_DATE = isodate;
	return Q.nfcall( ::repo.commit_all, isodate );
}
function fakeCommit () {
	return new Promise( resolve => setTimeout( resolve, 250 ) );
}
function makeCommits ( repo, first, days = 100 ) {
	return Q.async( function* commits () {
		let when = {
			yr: 2014,
			mo: 6,
			dy: 4,
			hr: 9,
			min: 22,
			sec: 49,
		};
		let date = dt( when );
		while ( days-- ) {
			// yield fakeCommit();
			yield makeCommit( repo, date );
			date.setDate( date.getDate() + 1 );
			console.log( days );
		}
		return date;
	} )();
}
openRepo( __dirname, {} )
	.then( repo => makeCommits( repo, {}, 10 ) )
	.then( ::console.log )
	;
	// 	console.log( repo.commit_all );
	// 	Q.nfcall( ::repo.add, '*' ).then( ::console.log );
	// } );
// const repo = new Repo( process.cwd(), {} );
// repo
// 	.then( (err,repo) => console.log( repo.commit_all+'' ) )
// .then( () => console.log( process.env.GIT_AUTHOR_DATE ) )
// ;

// repo.add( './main.js' )
// repo.commit_all( 'message', console.log )
// process.env.GIT_AUTHOR_DATE = '2015-03-21 08:16:41'
