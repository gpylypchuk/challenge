const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);
  const Pool = await ethers.getContractFactory("Pool");
  const deployed = await Pool.deploy();
  console.log("Ether Pool deployed at: ", deployed.address);
};

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });