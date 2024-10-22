const { gql } = require('apollo-server-express');

// Definición del esquema GraphQL
const typeDefs = gql`
    scalar Upload

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

    type TravelPlace {
        Id: ID!
        TravelId: Int
        PlaceId: Int
        active: Boolean
        travel: Travel
        place: Place  
    }

    type TravelCategory {
        travelPlace: TravelPlace
        travel: Travel
        place: Place
    }

    type TypePayment {
        Id: ID!
        Name: String
        Surcharge: Float
        active: Boolean
    }

    type Payment {
        Id: ID!
        ProofPayment: String
        Date: String
        Time: String
        Discount: Float 
        TypeId: Int
        Approved: Boolean
        active: Boolean
    }

    type PaymentTravelUser {
        Id: ID!
        TravelId: Int
        UserId: Int
        PaymentId: Int
        active: Boolean
    }

    type Query {
        users(limit: Int, offset: Int): [User]
        user(Id: ID!): User

        activities: [Activity]
        travels(limit: Int, offset: Int): [Travel]
        countries: [Country]
        cities: [City]
        placeCategories: [PlaceCategory]
        places: [Place]
        travelPlaces: [TravelPlace]
        travelsCompleted: [Travel]
        typePayments: [TypePayment]
        payments: [Payment]
        paymentsTravelUser: [PaymentTravelUser]
        

        activity(Id: ID!): Activity
        travel(Id: ID!): Travel
        country(Id: ID!): Country
        city(Id: ID!): City
        placeCategory(Id: ID!): PlaceCategory
        place(Id: ID!): Place
        travelPlace(Id: ID!): TravelPlace
        travelCategory(CategoryId: Int): [TravelCategory]
        travelByName(Name: String): [Travel]
        travelByDateRange(StartDate: String, EndDate: String): [Travel]
        typePayment(Id: ID!): TypePayment
        payment(Id: ID!): Payment
        paymentUser(Id: ID!): PaymentTravelUser
        paymentTravelUser(Id: ID!): PaymentTravelUser
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
        travelPlace: TravelPlace
        typePayment: TypePayment
        payment: Payment
        paymentTravelUser: PaymentTravelUser
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
            Image: Upload
            active: Boolean = true
        ): Response

        updateUser(
            Id: Int!
            NameUsers: String!
            LastName: String!
            Email: String!
            Phone: String
            Address: String
            Birthdate: String
            Image: Upload
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

        createTravelPlace(
            TravelId: Int
            PlaceId: Int
        ): Response

        createTypePayment(
            Name: String
            Surcharge: Float
        ): Response

        createPayment(
            ProofPayment: String
            Date: String
            Time: String
            Discount: Float 
            TypeId: Int
            Approved: Boolean
        ): Response

        createPaymentTravelUser(
            TravelId: Int
            UserId: Int
            PaymentId: Int
        ): Response
    }
`;

module.exports = typeDefs;