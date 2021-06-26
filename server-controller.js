const app = require("./server");
const { PORT } = require("./config");

//start server
app.listen(PORT, () => {
    console.log(`Now listening on PORT ${PORT}`);
});
