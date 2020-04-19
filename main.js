const kMeans = require('./kMeans')

const config = {
    x: [1, 2, 3, 4, 5, 10, 20, 30],
    y: [2, 3, 4, 5, 6, 20, 30, 40],
    cluster: 2
}

const kmeans = new kMeans()
kmeans.train(config)

kmeans.predict()