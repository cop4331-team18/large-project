import dotenv from 'dotenv';
import { Response } from 'express';
import {}
dotenv.config();

export const PORT: string = process.env.PORT || "5000";
export const MONGO_CONNECTION_STRING: string = process.env.MONGO_CONNECTION_STRING!;
export const MONGO_DB_NAME: string = process.env.MONGO_DB_NAME!;
export const USER_COLLECTION_NAME: string = "Users";
export const SESSION_SECRET: string = process.env.SESSION_SECRET!;

export function returnWithErrorJson(res: Response, error: string) {
    return res.status(406).json({error: error});
}

export function returnWithOKJson(res: Response) {
    return res.status(200).json({status: "OK"});
}

export const attributes = [
    {name: "Python"},
    {name: "C"},
    {name: "Java"},
    {name: "JavaScript"},
    {name: "TypeScript"},
    {name: "C++"},
    {name: "PHP"},
    {name: "Ruby"},
    {name: "Swift"},
    {name: "Kotlin"},
    {name: "Go"},
    {name: "SQL"},
    {name: "HTML"},
    {name: "CSS"},
    {name: "React"},
    {name: "Node.js"},
    {name: "Express.js"},
    {name: "Angular"},
    {name: "Vue.js"},
    {name: "Bootstrap"},
    {name: "jQuery"},
    {name: "Git"},
    {name: "GitHub"},
    {name: "GitLab"},
    {name: "Bitbucket"},
    {name: "Bash"},
    {name: "Linux"},
    {name: "Windows"},
    {name: "macOS"},
    {name: "Docker"},
    {name: "Kubernetes"},
    {name: "AWS"},
    {name: "Google Cloud"},
    {name: "Microsoft Azure"},
    {name: "Firebase"},
    {name: "MongoDB"},
    {name: "MySQL"},
    {name: "PostgreSQL"},
    {name: "SQLite"},
    {name: "Redis"},
    {name: "Elasticsearch"},
    {name: "REST APIs"},
    {name: "GraphQL"},
    {name: "SOAP"},
    {name: "JSON"},
    {name: "XML"},
    {name: "WebSockets"},
    {name: "Microservices"},
    {name: "Nginx"},
    {name: "Apache"},
    {name: "Jenkins"},
    {name: "CI/CD"},
    {name: "Agile Methodology"},
    {name: "Scrum"},
    {name: "JIRA"},
    {name: "Trello"},
    {name: "Test-Driven Development (TDD)"},
    {name: "Unit Testing"},
    {name: "Selenium"},
    {name: "Jest"},
    {name: "Mocha"},
    {name: "Jasmine"},
    {name: "Postman"},
    {name: "React Native"},
    {name: "Flutter"},
    {name: "Android Development"},
    {name: "iOS Development"},
    {name: "SwiftUI"},
    {name: "Xcode"},
    {name: "Android Studio"},
    {name: "SQL Server"},
    {name: "Firebase Firestore"},
    {name: "Laravel"},
    {name: "Django"},
    {name: "Flask"},
    {name: "Spring Boot"},
    {name: "Ruby on Rails"},
    {name: "Apache Kafka"},
    {name: "Redis"},
    {name: "Vagrant"},
    {name: "Terraform"},
    {name: "Virtualization"},
    {name: "CloudFormation"},
    {name: "OAuth"},
    {name: "JWT"},
    {name: "Web Security"},
    {name: "Cryptography"},
    {name: "OWASP Top 10"},
    {name: "Load Balancing"},
    {name: "Data Structures"},
    {name: "Algorithms"},
    {name: "Object-Oriented Programming (OOP)"},
    {name: "Functional Programming"},
    {name: "Design Patterns"},
    {name: "Computer Networks"},
    {name: "Version Control Systems"},
    {name: "Shell Scripting"},
    {name: "Data Analytics"},
    {name: "Data Visualization"},
    {name: "Excel"}
];
