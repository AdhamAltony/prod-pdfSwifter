import { getConnection } from '@/lib/db';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { createSessionToken, buildSessionCookie } from '@/lib/auth/session';

export async function POST ( req ) {
    try
    {
        const form = await req.formData();
        const email = form.get( 'email' );
        const password = form.get( 'password' );

        const pool = await getConnection();
        const userResult = await pool.request()
            .input( 'email', sql.VarChar( 100 ), email )
            .query( 'SELECT * FROM Users WHERE email = @email' );
        if ( userResult.recordset.length === 0 )
        {
            return new Response( JSON.stringify( { success: false, message: 'Invalid email or password' } ), { status: 401 } );
        }
        const user = userResult.recordset[ 0 ];
        const valid = await bcrypt.compare( password, user.password_hash );
        if ( !valid )
        {
            return new Response( JSON.stringify( { success: false, message: 'Invalid email or password' } ), { status: 401 } );
        }

        await pool.request()
            .input( 'id', sql.Int, user.id )
            .query( 'UPDATE Users SET last_login = GETDATE() WHERE id = @id' );

        const session = {
            user: { id: user.id, username: user.username, email: user.email, status: user.status },
            issuedAt: new Date().toISOString(),
        };
        const token = createSessionToken( session );
        const response = new Response(
            JSON.stringify( {
                success: true,
                message: 'Signed in successfully.',
                user: session.user,
            } ),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
        response.headers.set( 'Set-Cookie', buildSessionCookie( { token } ) );
        return response;
    } catch ( error )
    {
        return new Response( JSON.stringify( { success: false, error: error.message } ), { status: 500 } );
    }
}
