const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const qs = require("qs");
const fileUpload = require("express-fileupload");
const oneDriveAPI = require("onedrive-api");
const path = require("path");
const fs = require("fs");
var dirPath = "uploads";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
  console.log("文件夹创建成功");
} else {
  console.log("文件夹已存在");
}
const server = express();
server.use(
  fileUpload({
    createParentPath: true,
  })
);
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get("/onedrive_refresh", (req, res) => {
  const { refresh_token, redirect_uri } = req.query;
  const requestBody = {
    client_id: "ac96f9bf-94f2-49c0-8418-999b919bc236",
    refresh_token,
    grant_type: "refresh_token",
    client_secret: "-Fb8Lees-b~4EzgB2O48H4r-bOo.yLwpcF",
    redirect_uri,
  };
  axios
    .post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      qs.stringify(requestBody),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    )
    .then((result) => {
      res.send(result.data);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send("Something Wrong!");
    });
});
server.get("/onedrive_get", (req, res) => {
  const { code, redirect_uri } = req.query;
  const requestBody = {
    client_id: "ac96f9bf-94f2-49c0-8418-999b919bc236",
    code,
    grant_type: "authorization_code",
    client_secret: "-Fb8Lees-b~4EzgB2O48H4r-bOo.yLwpcF",
    redirect_uri,
  };
  axios
    .post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      qs.stringify(requestBody),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    )
    .then((result) => {
      res.send(result.data);
    })
    .catch((err) => {
      res.status(404).send("Something Wrong!");
    });
});
server.post("/onedrive_download", (req, res) => {
  var fileStream = oneDriveAPI.items.download({
    accessToken: req.body.ACCESS_TOKEN,
    itemId: req.body.backupId,
  });
  const writeStream = fs.createWriteStream("uploads/data.zip");
  writeStream.on("close", () => {
    console.log("close");
    res.sendFile(path.resolve("./uploads/data.zip"));
    res.on("finish", function () {
      try {
        fs.unlink(path.resolve("./uploads/data.zip"), (err) => {
          if (err) throw err;
          console.log("successfully deleted");
        });
      } catch (e) {
        console.log("error removing ");
      }
    });
  });
  fileStream.pipe(writeStream);
});
server.post("/onedrive_upload", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      const makeid = (length) => {
        var result = "";
        var characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      };
      let name = "data.zip";
      fs.writeFile(path.resolve("./uploads/" + name), "Hey there!", function (
        err
      ) {
        if (err) {
          return console.log(err);
        }
        let file = req.files.file;
        file.mv("./uploads/" + name);
        oneDriveAPI.items
          .uploadSession({
            accessToken: req.body.ACCESS_TOKEN,
            filename: name,
            fileSize: file.size,
            parentPath: "/Apps/Koodo Reader/",
            readableStream: fs.createReadStream("./uploads/" + name),
          })
          .then((result) => {
            res.send({
              status: true,
              message: "File is uploaded",
              data: {
                name: file.name,
                mimetype: file.mimetype,
                size: file.size,
                id: result.id,
              },
            });
            res.on("finish", function () {
              fs.unlink(path.resolve("./uploads/" + name), (err) => {
                if (err) throw err;
                console.log("successfully deleted");
              });
            });
          })
          .catch((err) => {
            console.log("upload failed");
            res.status(401).send(err);
          });
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

async function start() {
  try {
    const port = 3366;
    expressServer = await server.listen(port);
    const address = expressServer.address();
    serverInfo = {
      port: address.port,
      local: "localhost",
      url: `http://localhost:${address.port}`,
    };
    return serverInfo;
    // await reload(config, preload);

    return serverInfo;
  } catch (e) {
    return { message: e.message };
  }
}

async function startServer() {
  const { port, local, message } = await start();
  if (message) {
    console.error(message);
  } else {
    console.info(`启动成功，本地访问 http://${local}:${port}`);
  }
}

startServer();
