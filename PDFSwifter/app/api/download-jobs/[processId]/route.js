export const runtime = 'nodejs';

import { env as processEnv } from 'node:process';

const env = processEnv || (typeof process !== 'undefined' ? process.env : {}) || {};
const DEFAULT_API_BASE = 'https://api.pdfswifter.com';
const API_BASE = ( env.API_BASE_URL || env.TIKTOK_API_BASE_URL || env.YOUTUBE_API_BASE_URL || DEFAULT_API_BASE ).replace( /\/$/, '' );
const PDF_API_BASE = ( env.PDF_CONVERTER_API_BASE_URL || DEFAULT_API_BASE ).replace( /\/$/, '' );

export async function GET ( request, { params } ) {
  const resolved = await params;
  const processId = resolved?.processId;

  if ( !processId )
  {
    return Response.json( { success: false, message: 'Missing process ID' }, { status: 400 } );
  }

  try
  {
    const isPdfProcess = processId.startsWith( 'pdf-' );
    const upstream = await fetch(
      isPdfProcess
        ? `${ PDF_API_BASE }/pdf-convert/${ encodeURIComponent( processId ) }`
        : `${ API_BASE }/downloads/${ encodeURIComponent( processId ) }`,
      { cache: 'no-store' }
    );

    const body = await parseBody( upstream );

    if ( !upstream.ok )
    {
      const message = extractMessage( body ) || `Remote server responded with status ${ upstream.status }`;
      return Response.json( { success: false, message, raw: body }, { status: upstream.status } );
    }

    const job = normalizeJobPayload( body );
    job.id = processId;

    job.type = isPdfProcess ? 'pdf-conversion' : body?.source || 'download';

    return Response.json( { success: true, job, raw: body }, { status: 200 } );
  } catch ( error )
  {
    console.error(
      processId.startsWith( 'pdf-' ) ? 'PDF convert status error:' : 'download job status error:',
      error
    );
    return Response.json(
      { success: false, message: error?.message || 'Failed to query job status' },
      { status: 500 }
    );
  }
}

async function parseBody ( response ) {
  const contentType = response.headers.get( 'content-type' ) || '';
  if ( contentType.includes( 'application/json' ) )
  {
    return response.json();
  }

  const text = await response.text();
  try
  {
    return JSON.parse( text );
  } catch
  {
    return text;
  }
}

function extractMessage ( payload ) {
  if ( !payload ) return null;
  if ( typeof payload === 'string' ) return payload;
  if ( typeof payload === 'object' )
  {
    return payload.message || payload.detail || payload.error || payload.status_text || null;
  }
  return null;
}

function normalizeJobPayload ( payload ) {
  const job = {
    status: 'processing',
    message: '',
    progress: 0,
    downloadReady: false,
    error: false,
  };

  if ( typeof payload === 'string' )
  {
    job.message = payload;
    const pct = extractPercentFromString( payload );
    if ( pct !== null )
    {
      job.progress = pct;
    }
    if ( isCompletePhrase( payload ) )
    {
      job.downloadReady = true;
      job.progress = 100;
    }
    job.status = deriveStatusFromString( payload, job.downloadReady );
    return job;
  }

  if ( payload && typeof payload === 'object' )
  {
    job.message =
      payload.message ||
      payload.detail ||
      payload.status_text ||
      payload.statusMessage ||
      payload.description ||
      '';

    job.status = payload.status || payload.state || payload.phase || job.status;

    const numericProgress = pickNumber(
      payload.progress,
      payload.percentage,
      payload.percent,
      payload.progress_percent,
      payload.progressPercentage,
      payload.completion
    );
    if ( numericProgress !== null )
    {
      job.progress = clampPercentage( numericProgress );
    }

    if ( payload.bytes_downloaded !== undefined ) job.bytesDownloaded = Number( payload.bytes_downloaded );
    if ( payload.total_bytes !== undefined ) job.totalBytes = Number( payload.total_bytes );
    if ( payload.file_path ) job.filePath = payload.file_path;
    if ( payload.suggested_name ) job.filename = payload.suggested_name;

    if ( payload.ready !== undefined ) job.downloadReady = Boolean( payload.ready );
    if ( payload.completed !== undefined ) job.downloadReady = Boolean( payload.completed );
    if ( payload.success !== undefined ) job.downloadReady = job.downloadReady || Boolean( payload.success );
    if ( payload.is_ready !== undefined ) job.downloadReady = Boolean( payload.is_ready );
    if ( payload.status === 'completed' ) job.downloadReady = true;
    if ( payload.error || payload.failed || payload.status === 'failed' || /fail/i.test( String( payload.status || '' ) ) )
    {
      job.error = true;
      job.downloadReady = false;
      job.message = payload.error || job.message;
    }
  }

  if ( !job.downloadReady && isCompletePhrase( job.status ) )
  {
    job.downloadReady = true;
  }
  if ( !job.downloadReady && isCompletePhrase( job.message ) )
  {
    job.downloadReady = true;
  }
  if ( job.error )
  {
    job.downloadReady = false;
  }

  job.progress = clampPercentage( job.downloadReady ? 100 : job.progress );
  job.status = job.error ? 'failed' : job.downloadReady ? 'completed' : job.status || 'processing';
  if ( !job.message )
  {
    job.message = job.downloadReady ? 'Download ready' : 'Processing...';
  }

  return job;
}

function pickNumber ( ...values ) {
  for ( const value of values )
  {
    if ( value === undefined || value === null ) continue;
    const num = Number( value );
    if ( !Number.isNaN( num ) ) return num;
  }
  return null;
}

function clampPercentage ( value ) {
  const num = Number( value );
  if ( Number.isNaN( num ) ) return 0;
  return Math.min( 100, Math.max( 0, num ) );
}

function extractPercentFromString ( str ) {
  if ( typeof str !== 'string' ) return null;
  const match = str.match( /(\d+(?:\.\d+)?)\s*%/ );
  if ( !match ) return null;
  return Number( match[ 1 ] );
}

function isCompletePhrase ( value ) {
  if ( !value || typeof value !== 'string' ) return false;
  return /(complete|completed|finished|ready|success|successful|done)/i.test( value );
}

function deriveStatusFromString ( value, downloadReady ) {
  if ( !value || typeof value !== 'string' )
  {
    return downloadReady ? 'completed' : 'processing';
  }
  if ( /(error|failed|fail)/i.test( value ) ) return 'error';
  if ( downloadReady || isCompletePhrase( value ) ) return 'completed';
  return value;
}
