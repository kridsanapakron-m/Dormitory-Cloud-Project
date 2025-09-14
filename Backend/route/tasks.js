const express = require('express');
const router = express.Router();
const { db } = require('../db'); 
const { verifyToken } = require('../middleware/auth.middleware'); 
const { format } = require("date-fns");

router.post("/", verifyToken, (req, res) => {
  const data = req.body;
  try {
    let roomid = req.user.room;
    db.all("SELECT roomName FROM room WHERE id=?", [roomid], (err, row) => {
      if (err) {
        console.error("Query error:", err);
        return res
          .status(500)
          .json({ message: "Error while querying room: " + err });
      }

      if (!row[0] || !row[0].roomName) {
        return res.status(404).json({ message: "Room not found" });
      }

      let roomname = row[0].roomName;
      console.log("Room Name:", roomname);

      db.run(
        `INSERT INTO task (roomid, taskname, tasktype, taskdate, description, taskprice, priceset, taskstatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          roomid,
          `${data.taskname}`,
          data.tasktype,
          data.taskdate,
          data.description,
          data.taskprice || 0,
          data.priceset ? 1 : 0,
          0,
        ],
        function (err) {
          if (err) {
            console.error("Query error:", err);
            return res
              .status(500)
              .json({ message: "Cannot INSERT task: " + err });
          }

          console.log("Inserted task with ID:", this.lastID);
          res
            .status(200)
            .json({ message: "Task created!", taskID: this.lastID });
        }
      );
    });
  } catch (error) {
    console.error("Error while creating task: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", verifyToken, (req, res) => {
  let roomidQuery = "";
  if (req.query.roomid && !req.query.month) {
    roomidQuery = req.query.roomid ? `WHERE roomid = ?` : "";
  } else if (req.query.roomid && req.query.month) {
    console.log(req.query.roomid, req.query.month);
    roomidQuery = "WHERE roomid = ? AND strftime('%Y-%m', doneDate) = ?";
  }

  // Combine query string
  const query = `
      SELECT t.*, r.roomName 
      FROM task t 
      JOIN room r ON t.roomid = r.id 
      ${roomidQuery}
    `;

  let params = req.query.roomid ? [req.query.roomid] : [];
  if (req.query.roomid && req.query.month)
    params.push(format(new Date(req.query.month), "yyyy-MM"));

  db.all(query, params, (err, result) => {
    if (err) {
      console.error("Got Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    result.forEach((task) => {
      if (task.priceset) {
        delete task.priceset;
      } else {
        delete task.taskprice;
      }
    });

    res.status(200).json(result);
  });
});

router.get("/:taskid", verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM task WHERE taskid=${req.params["taskid"]}`,
    (ex, result) => {
      if (ex) {
        console.error("Got Error:", ex);
        res.status(500).json({ message: "Internet Server Error" });
      }
      result.forEach((s) => {
        if (s.priceset) {
          delete s.priceset;
        } else {
          delete s.taskprice;
        }
      });
      res.status(200).json(result);
    }
  );
});

router.put("/:taskid/setDone", verifyToken, (req, res) => {
  db.run(
    `UPDATE task SET taskstatus=1,doneDate=current_timestamp,taskprice=?,priceset=1 WHERE taskid=?`,
    [req.body.price, req.params["taskid"]],
    function(ex) {
      if (ex) {
        console.error(
          `Got Error while setting Task ${req.params["taskid"]} status: ${ex} `
        );
        return res.status(500).json({ message: "Internet Server Error" });
      }
      console.log(this.changes);
      if (this.changes == 0) {
        return res.status(404).json({
          message: `Task ${req.params["taskid"]} not found or it's already has been set.`,
        });
      }
      // console.log(val)
      return res.status(200).json({
        message: `Task ${req.params["taskid"]} status has been set to TRUE`,
      });
    }
  );
});

router.put("/:taskid/setTaskPrice", verifyToken, (req, res) => {
  db.all(
    `SELECT taskprice,priceset FROM task WHERE taskid=${req.params["taskid"]}`,
    (ex, val) => {
      if (ex) {
        console.error(
          `Get error during getting data to setTaskPrice using TASKID${req.params["taskid"]}: ${ex}`
        );
        res.status(500).json({ message: "Internet Server Error" });
      }
      console.log(val.length);
      if (!!val.length) {
        if (!Number.isNaN(req.body.taskprice)) {
          conn.query(
            `UPDATE task SET taskprice=${req.body.taskprice}, priceset=TRUE WHERE taskid=${req.params["taskid"]};`,
            (ex1, val1) => {
              if (ex1) {
                console.error(
                  `Get error during setting data to setTaskPrice using TASKID${req.params["taskid"]}: ${ex1}`
                );
                res.status(500).json({ message: "Internet Server Error" });
              }
              return res.status(200).json({
                message: `Price of Task ${req.params["taskid"]} has been set.`,
              });
            }
          );
        }
      } else {
        return res
          .status(404)
          .json({ message: `Task ${req.params["taskid"]} not found.` });
      }
    }
  );
});
module.exports = router;