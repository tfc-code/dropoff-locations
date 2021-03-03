provider "aws" {
  region = "us-east-1"
}

resource "aws_ecr_repository" "dropoff_locations_api" {
  name                 = "dropoff-locations-api"
  image_tag_mutability = "MUTABLE"
}
