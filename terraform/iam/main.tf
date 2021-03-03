provider "aws" {
  region = "us-east-1"
}

resource "aws_iam_group" "terraform" {
  name = "terraform"
}

resource "aws_iam_user" "terraform" {
  name = "terraform"
}

resource "aws_iam_user_group_membership" "terraform" {
  user = aws_iam_user.terraform.name

  groups = [
    aws_iam_group.terraform.name,
  ]
}

data "aws_iam_policy" "AWSElasticBeanstalkFullAccess" {
  arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkFullAccess"
}

resource "aws_iam_group_policy_attachment" "terraform_elastic_beanstalk" {
  group      = aws_iam_group.terraform.name
  policy_arn = data.aws_iam_policy.AWSElasticBeanstalkFullAccess.arn
}
