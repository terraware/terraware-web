#!/bin/bash

_private_ip_address=$(\
  aws ec2 describe-instances \
    --filters "Name=tag:Application,Values=seedbank" \
  | jq -r ' .Reservations[].Instances[].PrivateIpAddress')

echo $_private_ip_address | while read -r _ip; do
  ssh bastion curl -X POST $_ip/hooks/update?${SEEDBANK_WEBHOOK_TRIGGER}
done
