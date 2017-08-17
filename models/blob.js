import blake2 from 'blake2';

function hashText(text) {
  var h = blake2.createHash('blake2b', {digestLength: 20});
  h.update(new Buffer(text));
  return h.digest().toString('hex');
}

export default function (sequelize, DataTypes) {
  const Blob = sequelize.define('blob', {
    hash: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  Blob.fromText = async function (text) {
    let hash = hashText(text);
    let [blob] = await Blob.findOrCreate({
      where: { hash },
      defaults: { text },
    });
    return blob;
  };

  return Blob;
}
