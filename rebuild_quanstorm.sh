# Building command for Quantstorm
docker stop quantstorm
docker rm quantstorm
docker rmi quantstorm
docker build -t quantstorm .
