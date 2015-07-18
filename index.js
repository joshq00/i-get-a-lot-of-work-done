import Q from 'q';
import git from 'git';
import fs from 'fs';

const fil = __dirname + '/main.js';
const openRepo = Q.denodeify( ( ...args ) => new git.Repo( ...args ) );

const rnd = ( min = 0, max = 1 ) => min + Math.round( Math.random() * max );

const today = new Date();
const yearAgo = ( () => {
	let date = new Date();
	date.setDate( date.getDate() - 365 );
	return date;
} )();

function rndmDate () {
	return new Date( rnd( yearAgo.getTime(), today.getTime() ) );
}

function makeCommit ( repo, date ) {
	const isodate = date.toISOString();
	process.env.GIT_AUTHOR_DATE = process.env.GIT_COMMITTER_DATE = isodate;
	return Q.nfcall( fs.appendFile, fil, `\n// ${ isodate }`, {} )
		.then( () => Q.nfcall( ::repo.commit_all, isodate ) );
}

function makeCommits ( repo, commits = 100 ) {
	return Q.async( function* docommits () {
		while ( commits-- ) {
			let date = rndmDate();
			yield makeCommit( repo, date );
			console.log( commits );
		}
	} )();
}

openRepo( __dirname, {} )
	.then( repo => makeCommits( repo, 10 ) )
	;
