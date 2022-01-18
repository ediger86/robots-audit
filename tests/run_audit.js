const index = require("../index")
let args = process.argv;
args.splice(0,2);
const runTest = async (url) => {
    console.info("Starting test")
    const report = await index.runAudit({url: url})
    if(report){
        console.info("Test completed successfully")
    } else {
        console.error("Test failed")
    }
}

return runTest(args[0])