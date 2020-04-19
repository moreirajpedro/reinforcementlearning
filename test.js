module.exports = class test {
    constructor() {
        this.x_axis = []
        this.y_axis = []
        this.clusters = 2
        this.x_centroid = []
        this.y_centroid = []
        this.previous_clusterID = []

        this.ID1 = Math.floor(Math.random() * this.x_axis.length)
        this.ID2 = Math.floor(Math.random() * this.y_axis.length)
        this.calls = 0
    }

    ID_centroid() {
        const fs = require('fs')

        let positive = fs.readFileSync('positive.txt', 'utf8')
        positive = positive.toString().trim()

        if (positive.length > 0) {
            const lines = positive.split('\n')
            for (let i = 0; i < lines.length; i++) {
                const IDs = lines[i].split(',')
                const index1 = IDs[0]
                const index2 = IDs[1]

                this.ID1 = index1
                this.ID2 = index2
            }
        } else {
            let negative = fs.readFileSync('negative.txt', 'utf8')
            negative = negative.toString().trim()

            if (negative.length > 0) {
                const lines = negative.split('\n')

                let indexPairs = []
                for (let i = 0; i < lines.length; i++) {
                    const IDs = lines[i].split(',')
                    const index1 = IDs[0]
                    const index2 = IDs[1]

                    indexPairs.push([index1, index2])
                }
                this.indexStart(indexPairs)
            } else {
                this.ID1 = Math.floor(Math.random() * this.x_axis.length)
                this.ID2 = Math.floor(Math.random() * this.y_axis.length)
            }
        }
    }

    indexStart(matrix = []) {
        const i1 = Math.floor(Math.random() * this.x_axis.length);
        const i2 = Math.floor(Math.random() * this.y_axis.length);
        const sort = [i1, i2];
        let equal = 0;
        for (let i = 0; i < matrix.length; i++) {
            const temp = matrix[i];
            if ((temp[0] == sort[0]) && (temp[1] == sort[1])) equal++;
        }
        if (equal > 0) {
            if (this.calls < 10) {
                this.indexStart(matrix);
                this.calls++;
            } else {
                this.calls = 0;
            }
        } else {
            this.ID1 = i1;
            this.ID2 = i2;
        }
    }

    // Coleta o feedback do usuário em relação ao conjunto dos inputs
    _feedback() {
        const fs = require('fs')

        let positive = fs.readFileSync('positive.txt', 'utf8')
        positive = positive.toString().trim()

        if (positive.length <= 0) {
            const readLine = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            })
            readLine.question('Feedback positivo ou negativo?', (feedback) => {
                let fileName = 'negative.txt'
                if (feedback.toString().toLowerCase().trim() == 'positivo') fileName = 'positive.txt'

                let previousFile = fs.readFileSync(fileName, 'utf8')
                if (previousFile == undefined) previousFile = ''

                const newFile = previousFile + '\n' + this.ID1 + ',' + this.ID2
                fs.writeFileSync(fileName, newFile.toString().trim())

                if (feedback.toString().trim().length <= 0) feedback = 'negativo'

                console.log(`Seu feedback foi: ${feedback}`)

                readLine.close()
            })
        }


    }

    // Retorna a média dos eixos X de um determinado grupo
    clusterX_average = (IDs = [], clusterIDs = 0) => {
        // IDs: Array onde o índice corresponde ao ID e o valor do índice corresponde ao grupo
        // clusterIDs: Número correspondente ao grupo que terá a média calculada
        let sum = 0
        let total_of_clusters = 0
        for (let i = 0; i < IDs.length; i++) {
            if (IDs[i] == clusterIDs) {
                sum += this.x_axis[i]
                total_of_clusters++
            }
        }
        return sum / total_of_clusters
    }

    // Retorna a média dos eixos Y de um determinado grupo
    clusterY_average = (IDs = [], clusterIDs = 0) => {
        // IDs: Array onde o índice corresponde ao ID e o valor do índice corresponde ao grupo
        // clusterIDs: Número correspondente ao grupo que terá a média calculada
        let sum = 0
        let total_of_clusters = 0
        for (let i = 0; i < IDs.length; i++) {
            if (IDs[i] == clusterIDs) {
                sum += this.y_axis[i]
                total_of_clusters++
            }
        }
        return sum / total_of_clusters
    }

    // Atualiza os centróides dos eixos X
    centroidX_update = () => {
        if (this.x_centroid.length <= 0) {
            this.x_centroid[0] = this.x_axis[this.ID1]
            for (let i = 1; i < this.clusters; i++) {
                this.x_centroid[i] = this.x_axis[this.ID2]
            }
        } else {
            for (let i = 0; i < this.clusters; i++) {
                this.x_centroid[i] = this.clusterX_average(this.previous_clusterID, i)
            }
        }
    }

    // Atualiza os centróides dos eixos Y
    centroidY_update = () => {
        if (this.y_centroid.length <= 0) {
            this.y_centroid[0] = this.y_axis[this.ID1]
            for (let i = 1; i < this.clusters; i++) {
                this.y_centroid[i] = this.y_axis[this.ID2]
            }
        } else {
            for (let i = 0; i < this.clusters; i++) {
                this.y_centroid[i] = this.clusterY_average(this.previous_clusterID, i)
            }
        }
    }

    // Retorna o índice de um valor em um array
    // O índice retornado corresponde ao grupo que determinada linha pertende
    cluster(distances = [], shortestDistance = 0) {
        return distances.indexOf(shortestDistance)
    }

    // Verifica se dois arrays possuem todos os valores iguais
    checkClusters = (arr1 = [], arr2 = []) => {
        let output = true
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                output = false
            }
        }
        return output
    }

    // Atualiza os centróides e os grupos das linhas
    updateCluster = () => {
        this.centroidX_update()
        this.centroidY_update()

        let output = true
        let clusterID = []
        let distances = []
        let smallerDistances = []

        for (let i = 0; i < this.x_axis.length; i++) {
            for (let j = 0; j < this.clusters; j++) {
                distances[j] = Math.sqrt(Math.pow(this.x_axis[i] - this.x_centroid[j], 2) +
                    Math.pow(this.y_axis[i] - this.y_centroid[j], 2))
            }

            smallerDistances[i] = distances.reduce((a, b) => Math.min(a, b))
            // O ID é o índice e o valor é o grupo
            clusterID[i] = this.cluster(distances, smallerDistances[i])
        }

        if (this.previous_clusterID.length <= 0) {
            this.previous_clusterID = clusterID
        } else {
            if (this.checkClusters(this.previous_clusterID, clusterID)) {
                output = false
            } else {
                this.previous_clusterID = clusterID
                output = true
            }
        }
        return output
    }

    // Retorna os grupos formatados como arrays de uma matriz
    returnsClusterElements = (arrClusters = []) => {
        let clusterMatrix = []
        for (let i = 0; i < this.clusters; i++) {
            let clusterDivision = []
            for (let j = 0; j < arrClusters.length; j++) {
                if (arrClusters[j] == i) {
                    clusterDivision.push([this.x_axis[j], this.y_axis[j]])
                }
            }
            clusterMatrix.push(clusterDivision)
        }
        return clusterMatrix
    }

    // Inicia o treinamento
    train(config = {}) {
        this._config = {}
        if (config.x) this.x_axis = config.x; else this.x_axis = []
        if (config.y) this.y_axis = config.y; else this.y_axis = []
        if (config.cluster) this.clusters = config.cluster; else this.clusters = 2
        this._config.x = this.x_axis
        this._config.y = this.y_axis
        this._config.cluster = this.clusters

        this.ID_centroid()
    }

    saveModel(path = './Model/model.json') {
        const fs = require('fs')
        fs.writeFileSync(path, JSON.stringify(this._config))
    }

    loadModel(path = './Model/model.json') {
        const fs = require('fs')
        const data = fs.readFileSync(path, 'utf8')
        // Retornando a String para JSON
        const json = JSON.parse(data)
        this.x_axis = json.x
        this.y_axis = json.y
        this.clusters = json.cluster
    }

    // Inicia a clusterização
    predict = () => {
        this.x_centroid = []
        this.y_centroid = []
        this.previous_clusterID = []

        if ((this.clusters > 1) && (this.clusters < this.x_axis.length)) {
            if (this.x_axis.length > 2) {
                while (this.updateCluster()) { }
                const matrix = this.returnsClusterElements(this.previous_clusterID)
                console.log(matrix)
                this._feedback()
            } else {
                console.log([])
            }
        } else {
            console.log([])
        }
    }
}