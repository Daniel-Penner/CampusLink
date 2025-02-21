import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import background from "../../assets/background.png";

const About: React.FC = () => {
    return (
        <div
            className="flex flex-col items-center justify-center w-screen h-[calc(100vh)] bg-cover p-[5%]"
            style={{ backgroundImage: `url(${background})` }}
        >
            <Navbar />
            <div className="flex flex-col items-center justify-center w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] p-6 sm:p-8 lg:p-10 bg-secondaryBackground rounded-lg text-text text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-primary">About CampusLink</h1>
                <p className="text-lg sm:text-xl text-text mb-6">
                    CampusLink is a prototype web application developed as a proof of concept social networking platform for international students studying at UBCO. With this site, I hope to provide a way for international students to meet, discuss shared interests, seek academic mentorship, and work together to explore local businesses in Kelowna.
                </p>
                <h2 className="text-2xl font-semibold text-primary mb-4">What CampusLink Offers</h2>
                <ul className="text-lg sm:text-lg text-text list-disc list-inside mb-6">
                    <li>Establishing friendships with other international students at UBCO</li>
                    <li>Real time messaging and calling between students</li>
                    <li>Community servers for discussion and networking</li>
                    <li>Rating and reviewing local businesses</li>
                </ul>
                <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
                <p className="text-lg sm:text-xl text-text mb-6">
                    CampusLink is a way to foster community for UBCO international students. Adapting to life in a new city can be challenging, and by providing a platform to establish lifelong connections within Kelowna, CampusLink aims to make that process easier.
                </p>
                <a
                    href="/register"
                    className="mt-6 p-4 bg-primary text-buttonText rounded-md hover:bg-buttonHover transition-all"
                >
                    Join Now
                </a>
            </div>
        </div>
    );
};

export default About;
