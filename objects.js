//git add .
//git commit -m 'mesaj'
//git push

const obj = {
    name: "Andrei",
    greet: function() {
        // console.log("Hello, " + this.name);
        console.log(`Hello, ${this.name}`);
    },
    greet2: () => {
        // can not acces this.name
        console.log("Hello, " + this.name);
    }
}

obj.name = "Mihai"

obj.greet = function() {
    console.log('My name is not Adrian')
}

obj.greet();