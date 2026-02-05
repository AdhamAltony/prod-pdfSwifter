import { getConnection } from '@/lib/db';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

export async function POST ( req ) {
    try
    {
        const form = await req.formData();
        const username = form.get( 'username' );
        const email = form.get( 'email' );
        const password = form.get( 'password' );
        const subscription_type = 'free';
        const usage_limit = 3;
        const has_ads = 1;
        const status = 'active';
        const auth_provider = 'local';
        const password_hash = await bcrypt.hash( password, 10 );

        const pool = await getConnection();

        const exists = await pool.request()
            .input( 'username', sql.VarChar( 50 ), username )
            .input( 'email', sql.VarChar( 100 ), email )
            .query( 'SELECT id FROM Users WHERE username = @username OR email = @email' );

        if ( exists.recordset.length > 0 )
        {
            return new Response( JSON.stringify( { success: false, message: 'Username or email already exists' } ), { status: 400 } );
        }

        await pool.request()
            .input( 'username', sql.VarChar( 50 ), username )
            .input( 'email', sql.VarChar( 100 ), email )
            .input( 'password_hash', sql.VarChar( 255 ), password_hash )
            .input( 'subscription_type', sql.VarChar( 50 ), subscription_type )
            .input( 'usage_limit', sql.Int, usage_limit )
            .input( 'has_ads', sql.Bit, has_ads )
            .input( 'status', sql.VarChar( 50 ), status )
            .input( 'auth_provider', sql.VarChar( 50 ), auth_provider )
            .query( `INSERT INTO Users (username, email, password_hash, subscription_type, usage_limit, has_ads, status, auth_provider, join_date) 
              VALUES (@username, @email, @password_hash, @subscription_type, @usage_limit, @has_ads, @status, @auth_provider, GETDATE())`);

        return new Response( JSON.stringify( { success: true, message: 'User registered successfully' } ), { status: 201 } );
    } catch ( error )
    {
        console.error( 'Signup error:', error );
        return new Response( JSON.stringify( { success: false, error: error.message } ), { status: 500 } );
    }
}
