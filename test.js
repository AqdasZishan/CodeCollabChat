setTimeout(()=>{console.log(1)},0)

console.log(2)
 
new Promise((res) => {
    res()
    console.log(3)
}).then(()=>{console.log(4)})

console.log(5)

