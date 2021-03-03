provider "aws" {
  region = "us-east-1"
}

resource "aws_elastic_beanstalk_application" "dropoff_locations_api" {
  name = "dropoff-locations-api"
}
