# Literature Review for CampusLink

### Table of Contents:
1. [Introduction](#introduction)
2. [Analysis of Academic Papers](#analysis-of-academic-papers)
   - [Web Application Tech Stacks](#web-application-tech-stacks)
   - [Social Networking Development](#social-networking-development)
   - [International Student Networking](#international-student-networking)
   - [Large Language Model Integration](#large-language-model-integration)
3. [Analysis of Similar Websites](#analysis-of-similar-websites)
   - [Website 1: Discord](#website-1-discord)
   - [Website 2: Slack](#website-2-slack)
   - [Website 3: LinkedIn](#website-3-linkedin)
   - [Website 4: Instagram](#website-4-instagram)
4. [Research Gaps](#research-gaps)
5. [Conclusion](#conclusion)
6. [References](#references)

# Introduction

In today's highly interconnected world, social networking platforms are a tool that is very often used to alleviate a sense of growing isolation. For international students, these feelings can be accentuated due to challenges with language, cultural, and religious barriers. CampusLink strives to allow international students at smaller university campuses the opportunity to easily find others experiencing similar challenges, or seek mentorship from those who have overcome these difficulties. The following literature explores the best development practices, user interface design patterns, and technological stacks to ensure that CampusLink is as capable of achieving its desired purpose as possible. 

Through the analysis of academic research on web development, social networks, and the challenges of international students and thoroughly examining comparable websites like Discord, Slack, Instagram, and LinkedIn, this literature review aims to identify the best practices and technology for creating a modern, user friendly, and scalable platform. The insights gained from this review will guide the design and development processes to come, and in doing so greatly enhance the adopability and performance of the final product.

# Analysis of Academic Papers

## Web Application Tech Stacks

### ‘Web Development and Performance Comparison of Web Development Technologies in Node.js and Python’

- **Relevant Themes:** Web development, NodeJS, request handling
- **Key Findings:** Challapalli et al. (2021) developed simple web servers, one in Python with Flask and one in NodeJS with Express, to compare the latency, and rate at which each could handle requests. All three tests showed NodeJS with Express outperforming the Python server, able to handle hundreds of times as many requests, and with latency thousands of times smaller than that of the Python server. The undeniable efficiency demonstrated by NodeJS with Express in this paper when compared to another industry standard framework and language, further affirms my confidence in NodeJS and Express as being the ideal tools for developing CampusLink.
- **Critical Evaluation:** Despite the testing being definitive in regards to simply responding with a demo page, it would have been helpful if the paper had gone into additional detail with testing more extensive sites, and not just a single near-empty landing page. Seeing how the size of the response from the server impacts latency and request handling may have offered additional insight.
- **Tech Stack Implications:** This paper highlighted the blazing speed that NodeJS and ExpressJS can provide, which only leads to further confidence in the notion that they would be the ideal tools for developing the routing system for CampusLink. To test their web servers, Challapalli et al. (2021) used Locust, a Python testing framework, and Autocannon, a NodeJS benchmarking tool. Because benchmark testing will not be a key part of CampusLink’s development, the use of Autocannon or other such tools does not seem necessary. 

### ‘Evaluation and Comparison of Full-Stack JavaScript Technologies’

- **Relevant Themes:** Web development, NodeJS, ReactJS
- **Key Findings:** Weber (2022) authored a comprehensive analysis of full-stack JavaScript technologies, outlining and comparing every major framework and library. Extrapolating large sums of data from polls performed by StateofJS, a massive online survey platform regarding the current state of the JavaScript ecosystem, Weber (2022) concluded that the most popular frontend and backend Javascript frameworks were React and Express respectively. Additionally, it found those two to be the only frameworks which fit into the category of:  “High usage, high satisfaction. Safe technologies to adopt” (pp. 17, Weber). In comparison with predefined criteria, the paper concludes that the MERN (MongoDB, Express, React, NodeJS) technological stack is the “best to learn and promises the most potential” (pp. i, Weber). 
- **Critical Evaluation:** While this paper is extremely comprehensive, the results it gives to comparisons are resolved through somewhat unobjective means. While popularity is a measure that is objectively measured, how well-liked a software is is entirely subjective, and relying on a poll won’t always ensure an accurate demographic to generalize from, no matter the size. An additional tool for measurement that could have been used would have been the efficiency of different frameworks, that way there would be a more undeniable metric to go off of. 
- **Tech Stack Implications:** The popularity and versatility of the MERN tech stack would make it ideal for the development of CampusLink.

### ‘A Comparative Study: MongoDB vs. MySQL’

- **Relevant Themes:** Database Management Systems (DBMS), MySQL, MongoDB
- **Key Findings:** Gyorodi et al. (2015) ran performance tests for the four major operations performed by database management systems, to compare the speeds at which MySQL, the most popular SQL DBMS, and MongoDB, the most popular NoSQL DBMS, execute these tasks. In all four cases, MongoDB was able to perform operations in a fraction of the time of MySQL, which definitively shows it to be a more efficient tool for database management. If scalability is important in developing a web application, ensuring that the DBMS is efficient is of utmost importance, and as such, MongoDB seems to be the most reasonable DBMS to adopt for this project.
- **Critical Evaluation:** While the results of the paper are fairly definitive, the testing was conducted with specifications that do not necessarily reflect a standard modern computing environment. Windows 7 is at this point a highly outdated operating system, an intel i3 is a fairly weak processor, and 4GB of RAM is microscopic compared to that possessed by the majority of modern home computers. Additionally, the testing was only performed on a few simple database operations. MongoDB has severe limitations when creating more complex queries that MySQL does not. The fact that this is not explored in the paper makes its conclusion unnecessarily one-sided. 
- **Tech Stack Implications:** MongoDB is likely the ideal DBMS candidate for CampusLink, but it is important to at the very least take into consideration the restrictions it has, and the increased querying freedom MySQL may be able to offer.

## Social Networking Development

### ‘Web Application for Social Networking Using RTC’

- **Relevant Themes:** Web development, social networking, real-time communication (RTC)
- **Key Findings:** Pandey and Bein (2018) developed a student networking web application around WebRTC, an open-source framework for real-time, peer-to-peer, multimedia communication across the Internet. The application allowed for interaction between students and instructors through a Twitter-style Q&A forum, and real-time text and video chatting. The paper aimed to highlight the value of WebRTC as a tool to enable seamless browser integration for real-time video and text communication, without the need for extensions or downloads by users. Based on the effectiveness of WebRTC in the final application used for this paper, it could be a beneficial tool to implement for real-time communication in CampusLink.
- **Critical Evaluation:** Despite successfully showing off the power of WebRTC as a software, the web application fell short in terms of general development. Further development could have been focused on creating a more aesthetically pleasing user interface to create a more production-ready prototype. Additionally, work could have gone into security, as the final product involved the sending and receiving of data over minimally secured channels. Nonetheless, WebRTC was used successfully in a way that it could also be integrated into CampusLink. 
- **Tech Stack Implications:** The implementation of WebRTC described by Pandey and Bein (2018) presents a strong case for this technology as a means of establishing communication without the need for users to download external tools or browser extensions. Additionally, the javascript framework used for the front end aligns with modern industry-standard web development practices but would be successfully enhanced through pairing with a framework such as React.js to build a dynamic and interactive user interface.

## International Student Networking

### ‘Challenges for Global Learners: A Qualitative Study of the Concerns and Difficulties of International Students’

- **Relevant Themes:** International students, small campuses, social networks
- **Key Findings:** This paper analyzed major concerns and challenges for international students when studying at smaller American campuses. This seemed most applicable to CampusLink due to the target demographic being UBCO students, and UBCO is a relatively small campus on an international scale. The paper identified five particular points of difficulty for students: language, transportation, finances, cultural assimilation, and cultural or religious differences. This list gives a clear indication of what solutions to challenges should be prioritized when developing CampusLink.
- **Critical Evaluation:** Despite the very thorough analysis performed by Gautam et al. (2016), the sample demographic that was surveyed for this paper was fairly minimal. A larger sample size may reveal more unique challenges for individual students. 

## Large Language Model Integration

### ‘Translation Performance from the User’s Perspective of Large Language Models and Neural Machine Translation Systems’

- **Relevant Themes:** Language translation, large language models
- **Key Findings:** Son and Kim (2023) analyzed three major large language models and compared their abilities to accurately perform English to non-English or non-English to English translations. All three models: Google translate, Microsoft Translate, and ChatGPT performed more strongly when translating from a non-English language to English. While ChatGPT is becoming continuously better at a number of tasks, it significantly underperformed compared to the other two, more specialized systems. On the other hand, Google Translate was consistently the highest-performing of the three options. These results lead me to believe that it may be both easier and yield a more effective result to simply integrate the Google Translate API into CampusLink than to use an open-source LLM for handling translation.
- **Critical Evaluation:** This paper performs very extensive tests and approaches the topic from a very objective and analytical standpoint. That being said, ideally, the paper could have attempted to perform comparisons between more than three systems to show off differences between ChatGPT and other up-and-coming large language models.
- **Tech Stack Implications:** Because of the significant improvement that Google Translate is when compared to other major AI-powered translation options, it would be the ideal translation option to integrate into CampusLink.

### ‘Text-based Classification of Websites Using Self-hosted Large Language Models: An Accuracy and Efficiency Analysis’

- **Relevant Themes:** Large language models, self-hosted LLMs
- **Key Findings:** Sava (2024) analyzed the resource efficiency and accuracy of a number of large language models using the Ollama framework, a collection of lightweight, open-source large language models that are easily integrated into the web development process. The large sample size of different models provides very diverse and robust results for this paper. The findings suggest that the most accurate model is command-r-plus, while the most poorly performing are the LLAVA models. Despite the significant computational resources that the command-r-plus requires, given its outperformance of the other models, it is actually at a comfortable balance between efficiency and accuracy. 
- **Critical Evaluation:** Sava (2024) did not fine-tune the models before testing them. While this provides a good indication of which models are good out of the box, it could artificially cause some to underperform which could be much stronger if trained for this particular task. 
- **Tech Stack Implications:** If a self-hosted LLM is to be integrated into CampusLink, thanks to its out-of-the-box accuracy, command-r-plus would be the ideal choice.

# Analysis of Similar Websites

## Website 1: Discord 

Discord is currently among the most widely used social media platforms for students and is utilized both for collaboratively tackling academic projects and for fostering community, making it an excellent place to draw inspiration from.

### Styling/Design Choices:
- **Dark Mode as Default**: Dark mode reduces eye strain to make the site usable for long periods. Additionally, it provides a sense of minimalism and a modern look.
- **Dark Blues and Greys for Styling**: Despite being predominantly grey, Discord's background has a subtle blue tint to prevent it from feeling too monochrome and give it a pop of colour.
- **Minimalist UI**: By reducing clutter and unnecessary information on-screen, users can easily navigate and determine the functionality of each tool. 
- **Rouned Edges**: Rounded corners in web design are often associated with a sense of safety, approachability, and friendliness, which may help Discord more easily provide a sense of community to its users.

### Programming Choices:
- **React Frontend**: Provides a dynamic, modern, and responsive user interface. An industry standard across most modern interface-focused platforms.
- **Electron Framework**: By using the electron framework for desktop application design, the site design can feel very universal both on the web and as an app.
- **WebSocket API**: Allows for instantaneous real-time messaging and calls to provide a better sense of interpersonal connection between users.

### Navigation Choices:
- **Channel-Based Navigation**: Users can easily manage multiple simultaneous conversations without being overwhelmed by separating communication into multiple layers {servers -> channels -> threads}.
- **Hotkeys**: Keyboard shortcuts make navigation even more efficient for experienced users.

## Website 2: Slack

The biggest competitor to Discord and another site that fills the same general niche. Slack is a very prominent site for academic correspondence.

### Styling/Design Choices:
- **Clean and Professional Design**: A simple, professional design that makes it an obvious choice for business communication, but also makes use for casual users very manageable.
- **Custom Themes**: Allows users to customize the colours of their workspace. This may reduce the cohesion of the colour palette based on what the user chooses, but it offers freedom and adaptability.

### Programming Choices:
- **React Frontend**: Provides a dynamic, modern, and responsive user interface. An industry standard across most modern interface-focused platforms.
- **Real-Time Messaging Protocol (RTM)**: Ensures real-time updates and communication between users, to allow for effective professional communication.
- **Slackbot for Help**: An AI helper is integrated into the site to improve usability and control.

### Navigation Choices:
- **Channel-Based Navigation**: Like Discord, Slack uses channels and threads to divide communication in a way that is manageable to users.
- **Search Functionality**: A powerful search feature to allow users to navigate even more easily across all past communications.

## Website 3: LinkedIn

The primary web application worldwide for professional networking. Allows users to easily find and make connections, and employers to reach out to users based on profiles that detail skills and job experience.

### Styling/Design Choices:
- **Professional Aesthetic**: Clean, professional, and safe design made up of a simple colour palette and avoiding abrasive or experimental design choices. 
- **Clear Visual Hierarchy**: Displays profile, connections, and job opportunities with a distinct visual hierarchy.
- **Customizable Profiles**: Users can control how much information they provide to others. Plenty of information allows them to make very personalized connections, but they can also opt to share very little if they wish to prioritize privacy.

### Programming Choices:
- **React Frontend**: As the industry standard for clean and effective site design, LinkedIn, like Discord and Slack, has adopted React.
- **GraphQL API**: Given the massive amount of data LinkedIn works with, this API allows for that information to be efficiently queried and fetched.
- **Microservices Architecture**: LinkedIn’s platform uses microservices to make scaling more manageable and handle the high traffic it encounters.

### Navigation Choices:
- **Profile-Centric Navigation**: LinkedIn's design is profile-centered. making it easy for anyone to see your information and posts, and for you to seek out others.
- **Search Filters**: Users can filter for certain attributes when searching for jobs or other users.
- **Activity Feed**: Users are prevented with an active feed that is managed for them by an algorithm within the platform.

## Website 4: Instagram
Despite being unrelated to academics, Instagram is a huge social media platform that is widely used by students. 

### Styling/Design Choices:
- **Visual-First Layout**: Makes large photos and videos the focal point of the site, as they attract attention more easily than large chunks of text.
- **Minimalist Interface**: Reduces distractions and focuses on content, enhancing the browsing experience.
- **Responsive Design**: While Instagram is primarily designed for mobile, the website is fully responsive, and adjusts smoothly across all screen sizes.

### Programming Choices:
- **React Frontend**: By using React.js for the web app, and React Native for the mobile app, styling for Instagram is both modern and universal across platforms. 
- **GraphQL API**: Allows efficient data queries to manage the photos and videos that Instagram relies on.
- **Machine Learning for Feed**: Machine learning is utilized to personalize the feed based on user preferences, and implements AI-powered search features.

### Navigation Choices:
- **Bottom Tab Navigation**: A simple and intuitive sidebar helps users navigate different sections of the site.
- **Direct Messaging on Web**: The website version offers access to Instagram Direct, allowing users to send and receive messages from their desktop to enable more intimate communication between users on top of the existing interaction with content.
- **Hover Effects**: When users hover over their posts, a simple effect shows quick stats (likes and comments) which lets users gauge the popularity of their posts without needing to individually click into each one.

# Research Gaps

While the literature and sites above provide an abundance of valuable information, it is challenging to find academic research that combines a combination of these topics. While significant research exists on the implementation of secure messaging between users, and plenty of papers now cover AI-powered language translation, there is very little research attempting to use these in tandem. Simultaneously while there are plenty of attempts to create web application prototypes for students, there are few attempts to create them in a well-stylized and deployable manner. 

The general lack of specificity or project complexity in this field means that CampusLink can be among the first software of its kind. Not just a prototype web application for students, but one that implements growing large language models for help features. One that looks and works like a fully deployed and active website, and not just a few un-stylized pages as a proof-of-concept. By building CampusLink as a fully developed site rather than a minimal prototype to show off one feature, it can be tested as if it were a real, public web application, which allows for the most real-world generalization of any results.

# Conclusion

CampusLink's tech stack and design principles can be greatly improved by learning from other, comparable sites and by applying the results of academic research on similar topics. By using technologies like React and Express which are the most popular and generally liked frameworks in their respective field, and MongoDB which far exceeds the efficiency of other DBMSs, CampusLink can become a highly efficient, robust, and optimized web application. 

CampusLink has the possibility of becoming a safe and expressive space to foster connection between international students who may otherwise struggle to adapt to social life on campus in an environment they're not used to. By creating a modern, minimalist, and clean user interface inspired by the previously analyzed websites, CampusLink can become more easily adoptable to its target demographic.

# References

- Challapalli, S. S., et al. (2021). _Web development and performance comparison of Web Development Technologies in Node.js and Python_. DOI: [10.1109/ICTAI53825.2021.9673464](https://doi.org/10.1109/ictai53825.2021.9673464)
- Weber, N. (2022). _Evaluation and Comparison of Full-Stack JavaScript Technologies_. University of Applied Sciences Offenburg.
- Gyorodi, C., et al. (2015). _A comparative study: MongoDB vs. MySQL_. DOI: [10.1109/emes.2015.7158433](https://doi.org/10.1109/emes.2015.7158433)
- Pandey, N., & Bein, D. (2018). _Web application for social networking using RTC_. DOI: [10.1109/ccwc.2018.8301692](https://doi.org/10.1109/ccwc.2018.8301692)
- Gautam, C., et al. (2016). _Challenges for Global Learners: A qualitative study of the concerns and difficulties of international students_. DOI: [10.32674/jis.v6i2.368](https://doi.org/10.32674/jis.v6i2.368)
- Son, J., & Kim, B. (2023). _Translation performance from the user’s perspective of large language models and neural machine translation systems_. DOI: [10.3390/info14100574](https://doi.org/10.3390/info14100574)
- Sava, D.-M. (2024). _Text-based classification of websites using self-hosted Large Language Models: An accuracy and efficiency analysis_. University of Twente.
