import blake2 from 'blake2';

function hashText(text) {
  const h = blake2.createHash('blake2b', { digestLength: 20 });
  h.update(new Buffer(text));
  return h.digest().toString('hex');
}

export default function(sequelize, DataTypes) {
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

  Blob.fromText = async function(text, transaction) {
    const hash = hashText(text);
    const [blob] = await Blob.findOrCreate({
      where: { hash },
      defaults: { text },
      transaction,
    });
    return blob;
  };

  return Blob;
}
