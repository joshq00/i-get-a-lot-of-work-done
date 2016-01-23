import Q from 'q';
import git from 'git';
import fs from 'fs';

const fil = __dirname + '/main.js';
const openRepo = Q.denodeify( ( ...args ) => new git.Repo( ...args ) );

const rnd = ( min = 0, max = 1 ) => min + Math.round( Math.random() * ( max - min ) );

const today = new Date();
const yearAgo = new Date( Date.now() - 365 * 24 * 60 * 60 * 1000 );

function rndmDate () {
  return new Date( rnd( yearAgo.getTime(), today.getTime() ) );
}

function makeCommit ( repo, date ) {
  const isodate = date.toISOString();
  process.env.GIT_AUTHOR_DATE = process.env.GIT_COMMITTER_DATE = isodate;
  return Q.nfcall( fs.appendFile, fil, `// ${ isodate }\n`, {} )
    .then( () => Q.nfcall( ::repo.commit_all, isodate ) );
}

function makeCommits ( repo, commits = 100 ) {
  return Q.async( function* docommits () {
    while ( commits-- ) {
      yield makeCommit( repo, rndmDate() );
      console.log( commits );
    }
  } )();
}

openRepo( __dirname, {} )
  .then( repo => makeCommits( repo, process.argv[ 2 ] ) )
  ;
