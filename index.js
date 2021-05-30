const { ApolloServer, gql } = require('apollo-server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'makethislongandrandom';

const CSVToJSON = require('csvtojson');

// convert csv file to JSON array
async function getData() {
    
    let lang, countr
    let cpnvertToJSON = async () => {
        lang = await CSVToJSON().fromFile('/Users/subhrajyotimishra/github-repo/assignment/languages.csv')
            .then(languages => {
                return languages
            }).catch(err => {
                console.log(err);
            });

        countr = await CSVToJSON().fromFile('/Users/subhrajyotimishra/github-repo/assignment/countries.csv')
            .then(countries => {
                return countries.map((cn) => {
                    cn.Languages = cn.Languages.split(',')
                    return cn
                })
            }).catch(err => {
                console.log(err);
            });
    }
    await cpnvertToJSON()

    const db = {
        language: lang,
        country: countr
    };

    const server = new ApolloServer({
        typeDefs: gql`
    type Query {
      country(code: String): Country
    }
    type Language {
      country: Country
      Code: String!
     Name: String
     Native: String
    }
    type Country {
    languages: [Language]
    Code: String!
    Name: String
    Native: String
    Phone: Int
    Continents: String
    Capital: String
    Currency: String!
    }
  `,
        resolvers: {

            Query: {
                country: () => db.country,
                country: (_, { code }) =>
                    db.country.find(country => country.Code === code),
            },
            Language: {
                country: parent =>
                    db.country.find(({ code }) => parent.Code === code),
            },
            Country: {
                async languages(parent) {
                    const country = db.language.filter(({ Code }) => {
                        return parent.Languages.includes(Code)
                    }
                    );
                    return country;
                },
            },
        },
    });

    server.listen().then(({ url }) => console.log(`Server ready at ${url}`));
}

getData()