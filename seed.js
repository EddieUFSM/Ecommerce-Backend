import User from '/models/user';

User.create({name:"Eduardo", password: "a123456", email:"edrocha@inf.ufsm.br"}, function(err, user){
    console.log(user)
})