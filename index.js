import Q from 'q';
import git from 'git';
import fs from 'fs';

const fil = __dirname + '/main.js';
const openRepo = Q.denodeify( ( ...args ) => new git.Repo( ...args ) );

const rnd = ( min = 0, max = 1 ) => min + Math.round( Math.random() * max );
const today = new Date();
function rndmzDate ( date ) {
	date = new Date( date );
	date.setDate( date.getDate() + rnd( 0, 7 ) );
	date.setHours( rnd( 9, 20 ) );
	date.setMinutes( rnd( 0, 59 ) );
	date.setSeconds( rnd( 0, 59 ) );
	date.setMilliseconds( Math.random() * 1000 );
	if ( date.getTime() > today.getTime() ) {
		date.setDate( -rnd( 1, 365 ) );
	}
	return date;
}

function makeCommit ( repo, date ) {
	const isodate = date.toISOString();
	process.env.GIT_AUTHOR_DATE = process.env.GIT_COMMITTER_DATE = isodate;
	return Q.nfcall( fs.appendFile, fil, `\n// ${ isodate }`, {} )
		.then( () => Q.nfcall( ::repo.commit_all, isodate ) );
}

function makeCommits ( repo, commits = 100 ) {
	let date = new Date();
	date.setDate( date.getDate() - 365 );
	return Q.async( function* docommits () {
		while ( commits-- ) {
			yield makeCommit( repo, date );
			date = rndmzDate( date );
			console.log( commits );
		}
		return date;
	} )();
}

openRepo( __dirname, {} )
	.then( repo => makeCommits( repo, 10 ) )
	;
