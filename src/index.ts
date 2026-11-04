import app from "./app";

const port = Number(process.env.PORT) || 7000;
app.listen(port, () => {
  console.log(`TorBox Librarian addon listening on port ${port}`);
  console.log(`Configuration: http://127.0.0.1:${port}/configure`);
});
