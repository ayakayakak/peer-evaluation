const { ManagementClient } = require('auth0');

const auth0ManagementClient = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MANEGEMENT_API_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANEGEMENT_API_CLIENT_SECRET,
  scope: 'create:users read:users update:users delete:users'
})

const updateEmail = async (auth0id, newEmail) => {
  await auth0ManagementClient.updateUser({id: auth0id}, {email: newEmail}, async(e, user) => {
    if(e) throw e
    // メールアドレス変更後に新しいメールアドレスにverificationメールを送る
    await auth0ManagementClient.sendEmailVerification({user_id: auth0id}, (e) => {
      if(e) throw e
    })
  })
}

exports.updateEmail = updateEmail