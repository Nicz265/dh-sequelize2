const db = require ('../database/models');
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Movies = db.movies;
const Actores = db.actors;
const Generos = db.genres;


function OrderbyRating(req) {
	if (req.query.order_rating){
		return ['rating','DESC']
	} else {
		return ['title']
	}
}

module.exports = {
	root: (req, res) => {
		Movies
			.findAll({
				include: ['genre']
			})
			.then (movies => {
				return res.render('movies/index', {movies});
			})
			.catch(error => res.send(error));
    },
    detail: (req, res) => {
		Movies
			.findByPk(req.params.id,{
				include: ['genre', 'actors']
			})
			.then (movie => {
				return res.render('movies/detail', {movie});
			})
			.catch(error => res.send(error));
    },
    news: (req, res) => {
		Movies
			.findAll({
				order: [
					['release_date', 'DESC']
				],
				limit: 5
			})
			.then (movies => {
				return res.render('movies/news', {movies});
			})
			.catch(error => res.send(error));
    },
    recommend: (req, res) => {
		Movies
			.findAll({
				where:{
					rating: { [Op.gte] : 8 }
				},
				order: [
					['rating', 'DESC']
				]
			})
			.then (movies => {
				return res.render('movies/recommend', {movies});
			})
			.catch(error => res.send(error));
    },
    search: (req, res) => {
		Movies.findAll({
			where: {
				title: {[Op.like]: `%${req.query.search}%`}
			},
			order: [
				OrderbyRating(req)
			]
		})
		.then(results => {
			res.locals.results = results;
			return res.render('movies/search');
		})
		.catch(error => res.send(error));
	},
	create: (req,res) => {
		Generos
			.findAll()
			.then(genres => {
				Actores
					.findAll()
					.then(actors => {
						return res.render('movies/create', { genres, actors });
					})
					.catch(error => res.send(error));			
		})
			.catch(error => res.send(error));
	},
	edit: (req,res) => {
		Generos
			.findAll()
			.then(genres => {
				Movies
					.findByPk(req.params.id)
					.then (movie => {
						return res.render('movies/edit', {genres , movie});
					})
					.catch(error => res.send(error));
				})
			.catch(error => res.send(error));
	},
	save: (req,res)=>{
		Movies
			.create(req.body)
			.then(movieSaved => {
				movieSaved.addActors(req.body.actors);
				res.redirect('/movies')
			})
			.catch(error => res.send(error));
	},
	destroy: (req, res) => {
		Movies
			.findByPk(req.params.id, {
				include: ['actors']
			})
			.then(movie => {
				movie.removeActors(movie.actors);
				movie.destroy();
				return res.redirect('/');
			})
			.catch(error => res.send(error));
	},
	update: (req, res) => {
		Movies
			.update(req.body, {
				where: {
					id: req.params.id
				}
			})
			.then(() => res.redirect('/movies'))
			.catch(error => res.send(error));
	},
};