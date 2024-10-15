const { gql } = require('apollo-server-express');

// Definición del esquema GraphQL
const typeDefs = gql`
    type Activity {
        Id: ID!
        Description: String
        IconId: Int
        price: Float
        active: Boolean
    }

    type User {
        Id: ID!
        NameUsers: String
        LastName: String
        Email: String
        Phone: String
        Rol: String
        Address: String
        Birthdate: String
        Image: String
        active: Boolean
    }

    type Travel {
        Id: ID!
        Name: String
        DateStart: String
        HourStart: String
        DateEnd: String
        HourEnd: String
        Description: String
        Price: Float
        active: Boolean
    }

    type Country {
        Id: ID!
        Name: String
        active: Boolean
    }

    type City {
        Id: ID!
        Name: String
        Description: String
        CountryId: Int
        active: Boolean
    }

    type PlaceCategory {
        Id: ID!
        Name: String
        active: Boolean
    }
    
    type Place {
        Id: ID!
        Name: String
        Description: String
        CityId: Int
        PlaceCategoryId: Int
        active: Boolean
    }

    type Query {
        users: [User]
        user(Id: ID!): User

        activities: [Activity]
        travels: [Travel]
        countries: [Country]
        cities: [City]
        placeCategories: [PlaceCategory]
        places: [Place]

        activity(Id: ID!): Activity
        travel(Id: ID!): Travel
        country(Id: ID!): Country
        city(Id: ID!): City
        placeCategory(Id: ID!): PlaceCategory
        place(Id: ID!): Place
    }

    type Response {
        message: String!
        user: User
        token: String!
        travel: Travel
        country: Country
        city: City
        placeCategory: PlaceCategory
        place: Place
    }   
    
    # Definir el tipo Mutation
    type Mutation {
        createUser(
            NameUsers: String!
            LastName: String!
            Email: String!
            Password: String!
            Phone: String
            Rol: String
            Address: String
            Birthdate: String
            Image: String
            active: Boolean = true
        ): Response

        login(
            Email: String!
            Password: String!
        ): Response

        createTravel(
            Name: String
            DateStart: String
            HourStart: String
            DateEnd: String
            HourEnd: String
            Description: String
            Price: Float
        ): Response

        createCountry(
            Name: String
        ): Response

        createCity(
            Name: String
            Description: String
            CountryId: Int
        ): Response

        createPlaceCategory(
            Name: String
        ): Response

        createPlace(
            Name: String
            Description: String
            CityId: Int
            PlaceCategoryId: Int
        ): Response
    }
`;

module.exports = typeDefs;