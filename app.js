const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const convertDbObjToResponseObj = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }

  const getPlayers = `
    SELECT * FROM cricket_team;
  `
  const playersArray = await db.all(getPlayers)
  response.send(
    playersArray.map(eachPlayer => convertDbObjToResponseObj(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayers = `
  insert into cricket_team(player_name,jersey_number,role)
  values('${playerName}',
  ${jerseyNumber},
  '${role}'
  );`
  await db.run(addPlayers)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const convertDbObjTOResponseObj = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }

  const {playerId} = request.params
  const getPlayer = `
  select * from cricket_team where player_id = ${playerId};`
  const player = await db.get(getPlayer)
  response.send(convertDbObjTOResponseObj(player))
})

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body

  const updatePlayer = `
  update cricket_team set
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role= '${role}'
  where player_id = ${playerId};
   `
  await db.run(updatePlayer)
  response.send('Player Details Updated')
})

app.delete(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body

  const deletePlayer = `
  delete from cricket_team where player_id= ${playerId};`

  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
