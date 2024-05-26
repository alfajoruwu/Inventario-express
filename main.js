
const express = require("express");
const app = express();
const port = 4000;

app.get("/", (req, res) =>{
  res.send("Hola mi server en Express");
});
app.get('/product/:id', (req, res)=>{
  res.json({
    id:req.params.id,
    producto: "producto "+req.params.id,
    precio:1
  });
});
app.listen(port, () =>{
  console.log("Puerto: " + port);
});