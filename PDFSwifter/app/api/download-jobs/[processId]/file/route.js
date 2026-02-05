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
        ? `${ PDF_API_BASE }/pdf-convert/${ encodeURIComponent( processId ) }/file`
        : `${ API_BASE }/downloads/${ encodeURIComponent( processId ) }/file`,
      { cache: 'no-store' }
    );

    if ( !upstream.ok )
    {
      const errorBody = await parseError( upstream );
      const message = errorBody || `Remote server responded with status ${ upstream.status }`;
      return Response.json( { success: false, message }, { status: upstream.status } );
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const headers = new Headers();

    const contentType = upstream.headers.get( 'content-type' ) || 'application/octet-stream';
    let disposition =
      upstream.headers.get( 'content-disposition' ) ||
      `attachment; filename="youtube-download-${ processId }.mp4"`;

    headers.set( 'Content-Type', contentType );
    headers.set( 'Content-Disposition', disposition );
    headers.set( 'Cache-Control', 'no-store' );
    const contentLength = upstream.headers.get( 'content-length' );
    if ( contentLength )
    {
      headers.set( 'Content-Length', contentLength );
    }

    if ( isPdfProcess )
    {
      const upstreamStatus = await fetch( `${ PDF_API_BASE }/pdf-convert/${ encodeURIComponent( processId ) }`, {
        cache: 'no-store',
      } );

      if ( upstreamStatus.ok )
      {
        try
        {
          const statusData = await upstreamStatus.json();
          const convertTo = statusData?.job?.convertTo || 'excel';
          const extension = convertTo === 'excel' ? 'xlsx' : 'docx';
          disposition = `attachment; filename="pdf-converted-${ processId }.${ extension }"`; // 👈 غيرت ||= لـ = عشان يتكتب فوق الـ youtube
        } catch
        {
          disposition = `attachment; filename="pdf-converted-${ processId }.xlsx"`;
        }
      }
    }

    return new Response( arrayBuffer, { status: 200, headers } );
  } catch ( error )
  {
    console.error(
      processId.startsWith( 'pdf-' ) ? 'PDF convert file error:' : 'download job file error:',
      error
    );
    return Response.json(
      { success: false, message: error?.message || 'Failed to fetch download file' },
      { status: 500 }
    );
  }
}

async function parseError ( response ) {
  const contentType = response.headers.get( 'content-type' ) || '';
  if ( contentType.includes( 'application/json' ) )
  {
    try
    {
      const data = await response.json();
      return data?.message || data?.detail || data?.error || null;
    } catch
    {
      return null;
    }
  }

  try
  {
    return await response.text();
  } catch
  {
    return null;
  }
}
