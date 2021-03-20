const express = require('express')
const hbs = require('hbs')
const path = require('path')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 8888

const viewsPath = path.join(__dirname,'./../templates/views')
const publicPath = path.join(__dirname, './../public')

// Setup handles engine and views location
app.set('view engine','hbs')
app.set('views', viewsPath)

// Setup static directory to serve
app.use(express.static(publicPath))
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({limit: '50mb'}));
// app.use(express.bodyParser({limit: '50mb'}));

app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather App',
        name: 'Veronika'
    })
})

app.get('/translations', (req, res) => {

    const translations = loadTranslations()
    res.status(200).send(translations);
})

app.post('/translations', async (req, res) => {

    const translations = req.body

    // console.log(req.body)

    await saveTranslations(translations)

    res.status(200).send({message : "saved"});
})

const saveTranslations = (data) => {

    const dataJSON = JSON.stringify(data);
    fs.writeFileSync('./output/translations.json', dataJSON)

}

const loadTranslations = () => {
    try {
        const dataBuffer = fs.readFileSync('./input/translations.json')
        const dataJSON = dataBuffer.toString();
        const data = JSON.parse(dataJSON);
        
        return data

    } catch(error) {

        return {
            error: 'Error of read translations.json'
        }
    }
}

app.listen(port, () => {
    console.log(`Server is up on port ${port}\nhttp://localhost:${port}`)
})

